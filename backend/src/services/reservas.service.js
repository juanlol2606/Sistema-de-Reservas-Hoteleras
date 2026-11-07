import Habitacion from '../models/Habitacion.js';
import Hotel from '../models/Hotel.js';
import Huesped from '../models/Huesped.js';
import Reserva, { ESTADOS_ACTIVOS } from '../models/Reserva.js';
import { generarCodigoReserva } from '../utils/codigoReserva.js';
import { conflicto, noEncontrado } from '../utils/errores.js';
import { enExclusion } from '../utils/exclusion.js';
import { diasEntre } from '../utils/fechas.js';
import { paginar } from '../utils/paginacion.js';
import { coincidenciaParcial, formatearPesos } from '../utils/texto.js';
import { buscarTraslape, exigirSinTraslape } from './disponibilidad.service.js';
import { validarCapacidad, validarFechas, validarHuespedActivo, validarReservable } from './reglasReserva.service.js';

const POBLAR = [
  { path: 'huesped', select: 'nombre email' },
  { path: 'hotel', select: 'nombre direccion.ciudad' },
];

// Regla 6: con pagos >= 30 % del total la reserva pasa a confirmada.
const PORCENTAJE_CONFIRMACION = 30;

// Regla 7: transiciones válidas entre estados.
const TRANSICIONES = {
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['en_curso', 'cancelada'],
  en_curso: ['finalizada'],
  finalizada: [],
  cancelada: [],
};

const ESTADOS_MODIFICABLES = ['pendiente', 'confirmada'];
const ESTADOS_ELIMINABLES = ['pendiente', 'cancelada'];
const INTENTOS_CODIGO = 5;
const ID_MONGO = /^[a-f\d]{24}$/i;

const alcanzaAnticipo = (pagado, total) => pagado * 100 >= total * PORCENTAJE_CONFIRMACION;
const mismoId = (idTexto, id) => idTexto.toLowerCase() === id.toString();

export async function listarReservas({ estado, hotelId, desde, hasta, huesped, page, limit }) {
  const filtro = {};
  if (estado) filtro.estado = estado;
  if (hotelId) filtro.hotelId = hotelId;
  if (desde || hasta) filtro.fechaEntrada = { ...(desde && { $gte: desde }), ...(hasta && { $lte: hasta }) };
  if (huesped) filtro.huespedId = await condicionDeHuesped(huesped);

  return paginar({ Modelo: Reserva, filtro, orden: { fechaEntrada: -1, _id: -1 }, page, limit, populate: POBLAR });
}

// El filtro "huesped" acepta un id exacto o un texto que se busca en nombre, email y documento.
async function condicionDeHuesped(valor) {
  if (ID_MONGO.test(valor)) return valor;
  const coincidencia = coincidenciaParcial(valor);
  const ids = await Huesped.find({
    $or: [{ nombre: coincidencia }, { email: coincidencia }, { 'documento.numero': coincidencia }],
  }).distinct('_id');
  return { $in: ids };
}

async function buscarReserva(id) {
  const reserva = await Reserva.findById(id);
  if (!reserva) throw noEncontrado('Reserva no encontrada');
  return reserva;
}

export async function obtenerReserva(id) {
  return (await buscarReserva(id)).populate(POBLAR);
}

async function cargarHuesped(id) {
  const huesped = await Huesped.findById(id);
  if (!huesped) throw noEncontrado('Huésped no encontrado');
  return huesped;
}

async function cargarHabitacionConHotel(id) {
  const habitacion = await Habitacion.findById(id);
  if (!habitacion) throw noEncontrado('Habitación no encontrada');
  const hotel = await Hotel.findById(habitacion.hotelId);
  if (!hotel) throw noEncontrado('Hotel no encontrado');
  return { habitacion, hotel };
}

const copiarHabitacion = ({ numero, tipo, precioNoche }) => ({ numero, tipo, precioNoche });

export async function crearReserva({ huespedId, habitacionId, fechaEntrada, fechaSalida, numHuespedes }) {
  validarFechas(fechaEntrada, fechaSalida);
  const huesped = await cargarHuesped(huespedId);
  const { habitacion, hotel } = await cargarHabitacionConHotel(habitacionId);

  validarCapacidad(numHuespedes, habitacion);
  validarReservable({ hotel, habitacion });
  validarHuespedActivo(huesped);

  // Regla 5: el total lo calcula el servidor y la copia embebida congela el precio pactado.
  const noches = diasEntre(fechaEntrada, fechaSalida);
  const reserva = await enExclusion(String(habitacion._id), async () => {
    await exigirSinTraslape({ habitacionId: habitacion._id, entrada: fechaEntrada, salida: fechaSalida });
    return crearConCodigoUnico({
      huespedId: huesped._id,
      hotelId: hotel._id,
      habitacionId: habitacion._id,
      fechaEntrada,
      fechaSalida,
      noches,
      numHuespedes,
      habitacion: copiarHabitacion(habitacion),
      total: noches * habitacion.precioNoche,
    });
  });

  await retirarSiHuboCarrera(reserva);
  return obtenerReserva(reserva._id);
}

async function crearConCodigoUnico(datos) {
  for (let intento = 1; ; intento++) {
    try {
      return await Reserva.create({ ...datos, codigo: generarCodigoReserva() });
    } catch (error) {
      const codigoRepetido = error.code === 11000 && error.keyPattern?.codigo;
      if (!codigoRepetido || intento === INTENTOS_CODIGO) throw error;
    }
  }
}

// Respaldo del candado por habitación (que solo vale dentro de un proceso): si con varias instancias dos solicitudes
// pasan la verificación a la vez y al guardar hay otra en esas fechas, esta se retira.
async function retirarSiHuboCarrera(reserva) {
  const rival = await buscarTraslape({
    habitacionId: reserva.habitacionId,
    entrada: reserva.fechaEntrada,
    salida: reserva.fechaSalida,
    excluirReservaId: reserva._id,
  });
  if (!rival) return;

  await reserva.deleteOne();
  throw conflicto('La habitación acaba de ser reservada por otra solicitud', 'Intenta de nuevo con otras fechas u otra habitación');
}

export async function actualizarReserva(id, { huespedId, habitacionId, fechaEntrada, fechaSalida, numHuespedes }) {
  const reserva = await buscarReserva(id);
  if (!ESTADOS_MODIFICABLES.includes(reserva.estado)) {
    throw conflicto(`No se puede modificar una reserva ${reserva.estado}`, 'Solo se modifican reservas pendientes o confirmadas');
  }

  const cambioHuesped = !mismoId(huespedId, reserva.huespedId);
  const cambioHabitacion = !mismoId(habitacionId, reserva.habitacionId);
  const cambioFechas =
    fechaEntrada.getTime() !== reserva.fechaEntrada.getTime() || fechaSalida.getTime() !== reserva.fechaSalida.getTime();

  if (cambioFechas) validarFechas(fechaEntrada, fechaSalida);
  const { habitacion, hotel } = await cargarHabitacionConHotel(habitacionId);
  validarCapacidad(numHuespedes, habitacion);
  if (cambioHabitacion || cambioFechas) validarReservable({ hotel, habitacion });
  if (cambioHuesped) validarHuespedActivo(await cargarHuesped(huespedId));

  await enExclusion(String(habitacion._id), async () => {
    if (cambioHabitacion || cambioFechas) {
      await exigirSinTraslape({
        habitacionId: habitacion._id,
        entrada: fechaEntrada,
        salida: fechaSalida,
        excluirReservaId: reserva._id,
      });
    }

    // Si la habitación no cambia se conserva el precio pactado; si cambia, se congela el de la nueva.
    if (cambioHabitacion) {
      reserva.hotelId = hotel._id;
      reserva.habitacionId = habitacion._id;
      reserva.habitacion = copiarHabitacion(habitacion);
    }
    const noches = diasEntre(fechaEntrada, fechaSalida);
    const total = noches * reserva.habitacion.precioNoche;
    if (reserva.totalPagado > total) {
      throw conflicto(
        'El nuevo total es menor que lo ya pagado',
        `Total: ${formatearPesos(total)}, pagado: ${formatearPesos(reserva.totalPagado)}`,
      );
    }

    reserva.set({ huespedId, fechaEntrada, fechaSalida, noches, numHuespedes, total });
    if (reserva.estado === 'pendiente' && alcanzaAnticipo(reserva.totalPagado, total)) reserva.estado = 'confirmada';
    await reserva.save();
  });
  return obtenerReserva(id);
}

export async function cambiarEstado(id, nuevoEstado) {
  const reserva = await buscarReserva(id);
  const permitidos = TRANSICIONES[reserva.estado];

  if (!permitidos.includes(nuevoEstado)) {
    throw conflicto(
      `Transición no permitida: ${reserva.estado} → ${nuevoEstado}`,
      permitidos.length
        ? `Desde ${reserva.estado} solo se puede pasar a: ${permitidos.join(', ')}`
        : `Una reserva ${reserva.estado} no cambia de estado`,
    );
  }
  if (nuevoEstado === 'finalizada' && reserva.saldo > 0) {
    throw conflicto('No se puede finalizar con saldo pendiente', `Saldo: ${formatearPesos(reserva.saldo)}`);
  }

  const cambio = await Reserva.updateOne({ _id: reserva._id, estado: reserva.estado }, { estado: nuevoEstado });
  if (cambio.modifiedCount === 0) {
    throw conflicto('La reserva cambió de estado mientras se procesaba', 'Consúltala de nuevo e intenta otra vez');
  }
  return obtenerReserva(id);
}

export async function registrarPago(id, { monto, metodo }) {
  const reserva = await buscarReserva(id);
  if (!ESTADOS_ACTIVOS.includes(reserva.estado)) {
    throw conflicto(`No se pueden registrar pagos en una reserva ${reserva.estado}`);
  }
  if (monto > reserva.saldo) {
    throw conflicto('El pago supera el saldo pendiente', `Saldo: ${formatearPesos(reserva.saldo)}, pago: ${formatearPesos(monto)}`);
  }

  // Regla 6: el saldo se verifica dentro del propio update para que dos pagos simultáneos no superen el total.
  const registro = await Reserva.updateOne(
    {
      _id: reserva._id,
      estado: { $in: ESTADOS_ACTIVOS },
      $expr: { $lte: [{ $add: [{ $sum: '$pagos.monto' }, monto] }, '$total'] },
    },
    { $push: { pagos: { monto, metodo, fecha: new Date() } } },
  );
  if (registro.modifiedCount === 0) {
    throw conflicto('El saldo cambió mientras se procesaba el pago', 'Consulta la reserva de nuevo e intenta otra vez');
  }

  await Reserva.updateOne(
    {
      _id: reserva._id,
      estado: 'pendiente',
      $expr: {
        $gte: [{ $multiply: [{ $sum: '$pagos.monto' }, 100] }, { $multiply: ['$total', PORCENTAJE_CONFIRMACION] }],
      },
    },
    { estado: 'confirmada' },
  );
  return obtenerReserva(id);
}

export async function eliminarReserva(id) {
  const reserva = await buscarReserva(id);
  const sinMovimiento = reserva.pagos.length === 0 && ESTADOS_ELIMINABLES.includes(reserva.estado);
  if (!sinMovimiento) {
    throw conflicto(
      reserva.pagos.length ? 'No se puede eliminar una reserva con pagos registrados' : `No se puede eliminar una reserva ${reserva.estado}`,
      'Solo se eliminan reservas pendientes o canceladas sin pagos; las demás se cancelan o finalizan con PATCH /api/reservas/:id/estado',
    );
  }
  await reserva.deleteOne();
}
