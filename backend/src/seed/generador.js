import mongoose from 'mongoose';
import { METODOS_PAGO } from '../models/Reserva.js';
import { generarCodigoReserva } from '../utils/codigoReserva.js';
import { diasEntre, obtenerHoy, sumarDias } from '../utils/fechas.js';
import { crearAleatorio } from './aleatorio.js';
import {
  APELLIDOS,
  CIUDADES_COLOMBIA,
  CIUDADES_EXTRANJERAS,
  COMENTARIOS_POR_PUNTUACION,
  DISTRIBUCION_HABITACIONES,
  HOTELES,
  NOMBRES,
} from './datos.js';

const { ObjectId } = mongoose.Types;

const SEMILLA = 42;
const TOTAL_HUESPEDES = 50;
const PASO_MONTO = 5000;
const DIAS_PARA_PRECIO_ANTIGUO = 90;
const FACTOR_PRECIO_ANTIGUO = 0.9;
const PROBABILIDAD_RESENA = 0.66;
const MAXIMO_INTENTOS = 500;
const MS_POR_HORA = 60 * 60 * 1000;

// Se crean en este orden: las primeras son las más restringidas en fechas y necesitan habitación libre.
const RESERVAS_POR_ESTADO = [
  ['en_curso', 6],
  ['confirmada', 17],
  ['pendiente', 12],
  ['finalizada', 95],
  ['cancelada', 20],
];
const NOCHES_PONDERADAS = [[1, 12], [2, 28], [3, 25], [4, 15], [5, 10], [6, 6], [7, 4]];
const HUESPEDES_PONDERADOS = [[1, 35], [2, 40], [3, 15], [4, 10]];
const LETRAS_PASAPORTE = 'ABCDEFGHJKLMNPRSTUVWXYZ';

const redondearA = (valor, paso) => Math.round(valor / paso) * paso;
const redondearArriba = (valor, paso) => Math.ceil(valor / paso) * paso;
const redondearAbajo = (valor, paso) => Math.floor(valor / paso) * paso;
const fechaMenor = (a, b) => (a < b ? a : b);
const normalizarTexto = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function generarDatos() {
  const azar = crearAleatorio(SEMILLA);
  const hoy = obtenerHoy();
  const ahora = new Date();
  const conHora = (fecha) => {
    const horaDelDia = azar.entero(13, 22) * MS_POR_HORA + azar.entero(0, 59) * 60 * 1000;
    return fechaMenor(new Date(fecha.getTime() + horaDelDia), ahora);
  };
  const contexto = { azar, hoy, conHora };

  const { hoteles, habitaciones } = crearHotelesYHabitaciones(azar);
  const huespedes = crearHuespedes(azar);
  const registros = crearReservas({ ...contexto, habitaciones, huespedes });
  const resenas = crearResenas({ ...contexto, registros, hoteles });

  asignarCalificacionPromedio(hoteles, resenas);
  asignarFechaRegistro({ ...contexto, huespedes, registros });

  const reservas = registros
    .map(({ reserva }) => reserva)
    .sort((a, b) => a.fechaEntrada - b.fechaEntrada);

  return { hoteles, habitaciones, huespedes, reservas, resenas };
}

function crearHotelesYHabitaciones(azar) {
  const hoteles = [];
  const habitaciones = [];

  for (const definicion of HOTELES) {
    const hotel = {
      _id: new ObjectId(),
      nombre: definicion.nombre,
      estrellas: definicion.estrellas,
      activo: true,
      direccion: { ...definicion.direccion },
      contacto: { ...definicion.contacto },
      servicios: [...definicion.servicios],
      calificacionPromedio: 0,
    };
    hoteles.push(hotel);

    for (const grupo of DISTRIBUCION_HABITACIONES) {
      grupo.numeros.forEach((numero, indice) => {
        const variacionDePrecio = 1 + azar.entero(0, 3) * 0.04;
        habitaciones.push({
          _id: new ObjectId(),
          hotelId: hotel._id,
          numero,
          tipo: grupo.tipo,
          capacidad: grupo.capacidades[indice],
          precioNoche: redondearA(definicion.precioBase * grupo.multiplicador * variacionDePrecio, PASO_MONTO),
          estado: definicion.enMantenimiento.includes(numero) ? 'mantenimiento' : 'disponible',
          activo: true,
          amenidades: [...grupo.amenidades],
        });
      });
    }
  }

  return { hoteles, habitaciones };
}

function crearHuespedes(azar) {
  const huespedes = [];
  const emails = new Set();
  const documentos = new Set();
  const nombresCompletos = new Set();

  while (huespedes.length < TOTAL_HUESPEDES) {
    const nombre = azar.elegir(NOMBRES);
    const apellido = azar.elegir(APELLIDOS);
    const nombreCompleto = `${nombre} ${apellido} ${azar.elegir(APELLIDOS)}`;
    const extranjero = azar.probabilidad(0.18);
    const tipoDocumento = extranjero ? azar.elegirPonderado([['PA', 70], ['CE', 30]]) : 'CC';
    const numeroDocumento = generarNumeroDocumento(azar, tipoDocumento);

    if (nombresCompletos.has(nombreCompleto) || documentos.has(numeroDocumento)) continue;
    nombresCompletos.add(nombreCompleto);
    documentos.add(numeroDocumento);

    const [ciudadExtranjera, prefijo] = azar.elegir(CIUDADES_EXTRANJERAS);
    huespedes.push({
      _id: new ObjectId(),
      nombre: nombreCompleto,
      email: generarEmailUnico(emails, nombre, apellido),
      documento: { tipo: tipoDocumento, numero: numeroDocumento },
      telefono: extranjero ? `+${prefijo}${azar.entero(100000000, 999999999)}` : generarTelefonoMovil(azar),
      ciudadOrigen: extranjero ? ciudadExtranjera : azar.elegir(CIUDADES_COLOMBIA),
      activo: true,
    });
  }

  return huespedes;
}

function generarNumeroDocumento(azar, tipo) {
  if (tipo === 'CC') return String(azar.entero(10000000, 1999999999));
  if (tipo === 'CE') return String(azar.entero(100000, 9999999));
  const letras = azar.elegir([...LETRAS_PASAPORTE]) + azar.elegir([...LETRAS_PASAPORTE]);
  return letras + String(azar.entero(0, 9999999)).padStart(7, '0');
}

function generarTelefonoMovil(azar) {
  const resto = String(azar.entero(0, 9999999)).padStart(7, '0');
  return `3${azar.entero(0, 2)}${azar.entero(0, 9)}${resto}`;
}

function generarEmailUnico(emails, nombre, apellido) {
  const base = `${normalizarTexto(nombre.split(' ')[0])}.${normalizarTexto(apellido)}`;
  let email = `${base}@example.com`;
  for (let sufijo = 2; emails.has(email); sufijo++) {
    email = `${base}${sufijo}@example.com`;
  }
  emails.add(email);
  return email;
}

function crearReservas({ azar, hoy, conHora, habitaciones, huespedes }) {
  const habitacionesReservables = habitaciones.filter((h) => h.estado === 'disponible' && h.activo);
  const ocupacionPorHabitacion = new Map();
  const ocupacionPorHuesped = new Map();
  const codigos = new Set();
  const registros = [];

  const hayTraslape = (ocupacion = [], entrada, salida) =>
    ocupacion.some((tramo) => tramo.entrada < salida && tramo.salida > entrada);

  const registrarOcupacion = (mapa, id, tramo) => mapa.set(id, [...(mapa.get(id) ?? []), tramo]);

  function crearRegistro(estado) {
    for (let intento = 0; intento < MAXIMO_INTENTOS; intento++) {
      const habitacion = azar.elegir(habitacionesReservables);
      const huesped = azar.elegirSesgado(huespedes);
      const noches = estado === 'en_curso' ? azar.entero(3, 7) : azar.elegirPonderado(NOCHES_PONDERADAS);
      const entrada = elegirEntrada(azar, estado, noches, hoy);
      const salida = sumarDias(entrada, noches);
      const tramo = { entrada, salida };
      const llaveHabitacion = habitacion._id.toString();
      const llaveHuesped = huesped._id.toString();

      // Una reserva cancelada libera la habitación y al huésped, por eso no bloquea fechas.
      if (estado !== 'cancelada') {
        const hayConflicto =
          hayTraslape(ocupacionPorHabitacion.get(llaveHabitacion), entrada, salida) ||
          hayTraslape(ocupacionPorHuesped.get(llaveHuesped), entrada, salida);
        if (hayConflicto) continue;
        registrarOcupacion(ocupacionPorHabitacion, llaveHabitacion, tramo);
        registrarOcupacion(ocupacionPorHuesped, llaveHuesped, tramo);
      }

      return construirRegistro({ estado, habitacion, huesped, noches, entrada, salida });
    }
    throw new Error(`No se pudo ubicar una reserva '${estado}' sin traslapes`);
  }

  function construirRegistro({ estado, habitacion, huesped, noches, entrada, salida }) {
    const esAntigua = diasEntre(entrada, hoy) > DIAS_PARA_PRECIO_ANTIGUO;
    const precioNoche = esAntigua
      ? redondearA(habitacion.precioNoche * FACTOR_PRECIO_ANTIGUO, PASO_MONTO)
      : habitacion.precioNoche;
    const total = noches * precioNoche;

    const anticipacion = azar.entero(2, 45);
    const creada = fechaMenor(sumarDias(entrada, -anticipacion), sumarDias(hoy, -azar.entero(0, 15)));

    let codigo;
    do {
      codigo = generarCodigoReserva(azar.numero);
    } while (codigos.has(codigo));
    codigos.add(codigo);

    const reserva = {
      _id: new ObjectId(),
      codigo,
      huespedId: huesped._id,
      hotelId: habitacion.hotelId,
      habitacionId: habitacion._id,
      fechaEntrada: entrada,
      fechaSalida: salida,
      noches,
      numHuespedes: Math.min(habitacion.capacidad, azar.elegirPonderado(HUESPEDES_PONDERADOS)),
      estado,
      habitacion: { numero: habitacion.numero, tipo: habitacion.tipo, precioNoche },
      pagos: crearPagos({ azar, hoy, conHora, estado, total, creada, salida }),
      total,
    };
    return { reserva, creada };
  }

  for (const [estado, cantidad] of RESERVAS_POR_ESTADO) {
    for (let i = 0; i < cantidad; i++) registros.push(crearRegistro(estado));
  }

  return registros;
}

function elegirEntrada(azar, estado, noches, hoy) {
  switch (estado) {
    case 'finalizada':
      return sumarDias(hoy, -azar.entero(noches, 180));
    case 'cancelada':
      return sumarDias(hoy, azar.entero(-170, 45));
    case 'en_curso':
      return sumarDias(hoy, -azar.entero(0, noches - 1));
    case 'confirmada':
      return sumarDias(hoy, azar.entero(0, 45));
    case 'pendiente':
      return sumarDias(hoy, azar.entero(3, 60));
  }
}

// Monto acumulado según el estado: pendiente < 30 %, confirmada o más >= 30 %, finalizada = total, cancelada sin pagos.
function calcularMontoPagado(azar, estado, total) {
  switch (estado) {
    case 'finalizada':
      return total;
    case 'en_curso':
      return Math.min(total, redondearArriba(total * azar.decimal(0.5, 1), PASO_MONTO));
    case 'confirmada':
      return Math.min(total, redondearArriba(total * azar.decimal(0.3, 1), PASO_MONTO));
    case 'pendiente':
      return azar.probabilidad(0.5) ? 0 : redondearAbajo(total * azar.decimal(0.1, 0.25), PASO_MONTO);
    default:
      return 0;
  }
}

function crearPagos({ azar, hoy, conHora, estado, total, creada, salida }) {
  const pagado = calcularMontoPagado(azar, estado, total);
  if (pagado === 0) return [];

  const fechaPrimerPago = fechaMenor(sumarDias(creada, azar.entero(0, 2)), hoy);
  const fechaLimite = estado === 'finalizada' ? salida : hoy;
  const dividirEnDos = azar.probabilidad(0.55);
  const montoPrimerPago = dividirEnDos
    ? Math.min(pagado, redondearArriba(pagado * azar.decimal(0.5, 0.8), PASO_MONTO))
    : pagado;

  const pagos = [[montoPrimerPago, fechaPrimerPago]];
  if (montoPrimerPago < pagado) {
    const dias = azar.entero(0, Math.max(0, diasEntre(fechaPrimerPago, fechaLimite)));
    pagos.push([pagado - montoPrimerPago, sumarDias(fechaPrimerPago, dias)]);
  }

  return pagos
    .map(([monto, fecha]) => ({ monto, metodo: azar.elegir(METODOS_PAGO), fecha: conHora(fecha) }))
    .sort((a, b) => a.fecha - b.fecha);
}

function crearResenas({ azar, conHora, registros, hoteles }) {
  const calidadPorHotel = new Map(hoteles.map((hotel, i) => [hotel._id.toString(), HOTELES[i].calidadResenas]));

  return registros
    .filter(({ reserva }) => reserva.estado === 'finalizada' && azar.probabilidad(PROBABILIDAD_RESENA))
    .map(({ reserva }) => {
      const calidad = calidadPorHotel.get(reserva.hotelId.toString());
      const variacion = (azar.numero() + azar.numero() - 1) * 1.6;
      const puntuacion = Math.min(5, Math.max(1, Math.round(calidad + variacion)));

      return {
        _id: new ObjectId(),
        reservaId: reserva._id,
        hotelId: reserva.hotelId,
        huespedId: reserva.huespedId,
        puntuacion,
        comentario: azar.elegir(COMENTARIOS_POR_PUNTUACION[puntuacion]),
        fecha: conHora(sumarDias(reserva.fechaSalida, azar.entero(0, 7))),
      };
    });
}

// Misma regla que aplicará el servicio de reseñas: promedio de las reseñas del hotel con dos decimales.
function asignarCalificacionPromedio(hoteles, resenas) {
  for (const hotel of hoteles) {
    const delHotel = resenas.filter((resena) => resena.hotelId.equals(hotel._id));
    const suma = delHotel.reduce((acumulado, resena) => acumulado + resena.puntuacion, 0);
    hotel.calificacionPromedio = delHotel.length ? Math.round((suma / delHotel.length) * 100) / 100 : 0;
  }
}

// Un huésped se registra antes de su primera reserva.
function asignarFechaRegistro({ azar, hoy, conHora, huespedes, registros }) {
  for (const huesped of huespedes) {
    const creaciones = registros
      .filter(({ reserva }) => reserva.huespedId.equals(huesped._id))
      .map(({ creada }) => creada.getTime());
    const referencia = creaciones.length ? new Date(Math.min(...creaciones)) : sumarDias(hoy, -azar.entero(1, 120));
    huesped.fechaRegistro = conHora(sumarDias(referencia, -azar.entero(1, 3)));
  }
}
