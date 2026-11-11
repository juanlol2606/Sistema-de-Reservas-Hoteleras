import Habitacion, { TIPOS_HABITACION } from '../models/Habitacion.js';
import Hotel from '../models/Hotel.js';
import Reserva from '../models/Reserva.js';
import { noEncontrado } from '../utils/errores.js';
import { diasEntre, formatearFecha, lunesDeLaSemana, obtenerHoy, sumarDias } from '../utils/fechas.js';
import { filtroDeTraslape } from './disponibilidad.service.js';
import { porcentaje } from './reportes.service.js';

const porTipoYNumero = (a, b) =>
  TIPOS_HABITACION.indexOf(a.tipo) - TIPOS_HABITACION.indexOf(b.tipo) || a.numero.localeCompare(b.numero, 'es', { numeric: true });

const estaEnServicio = (habitacion) => habitacion.activo && habitacion.estado === 'disponible';

// Las reservas que ocupan alguna noche del rango: la misma condición de traslape con la que se rechaza una reserva doble.
async function reservasDelRango(habitacionIds, desde, finExclusivo) {
  const reservas = await Reserva.find({
    habitacionId: { $in: habitacionIds },
    ...filtroDeTraslape({ entrada: desde, salida: finExclusivo }),
  })
    .select('codigo huespedId habitacionId fechaEntrada fechaSalida noches estado total pagos')
    .populate({ path: 'huesped', select: 'nombre' })
    .sort({ fechaEntrada: 1, _id: 1 });

  return reservas.map((reserva) => ({
    _id: reserva._id,
    codigo: reserva.codigo,
    habitacionId: reserva.habitacionId,
    huesped: { nombre: reserva.huesped?.nombre },
    fechaEntrada: reserva.fechaEntrada,
    fechaSalida: reserva.fechaSalida,
    noches: reserva.noches,
    estado: reserva.estado,
    saldo: reserva.saldo,
  }));
}

// Una reserva ocupa la noche `indice` (0 = primera del rango) si ini <= indice < fin; la noche de la salida queda libre.
const ocupanLaNoche = (indice) => ({
  $filter: {
    input: '$reservas',
    as: 'r',
    cond: { $and: ['$$r.enServicio', { $lte: ['$$r.ini', indice] }, { $gt: ['$$r.fin', indice] }] },
  },
});

const contarReservas = (condicion) => ({ $size: { $filter: { input: '$reservas', as: 'r', cond: condicion } } });

async function calcularOcupacion({ hotelId, habitacionIds, habitacionesEnServicio, desde, dias }) {
  const hoy = obtenerHoy();
  const indiceHoy = diasEntre(desde, hoy);
  const enServicio = habitacionesEnServicio.length;
  // Sin habitaciones en servicio no hay nada que dividir: el divisor mínimo 1 deja todos los porcentajes en 0.
  const divisor = Math.max(enServicio, 1);
  const ocupadasEstaNoche = ocupanLaNoche(indiceHoy);

  // ¿Cuántas habitaciones en servicio ocupa cada noche del rango y qué pasa hoy? Parte del hotel para que siempre devuelva un documento.
  const [calculo] = await Hotel.aggregate([
    { $match: { _id: hotelId } },
    {
      $lookup: {
        from: 'reservas',
        pipeline: [
          {
            $match: {
              habitacionId: { $in: habitacionIds },
              // Las del rango, más las que tocan hoy (aunque el rango esté en otro mes) para llegadas, salidas y libres.
              $or: [
                filtroDeTraslape({ entrada: desde, salida: sumarDias(desde, dias) }),
                filtroDeTraslape({ entrada: sumarDias(hoy, -1), salida: sumarDias(hoy, 1) }),
              ],
            },
          },
          {
            $project: {
              _id: 0,
              estado: 1,
              ini: { $dateDiff: { startDate: desde, endDate: '$fechaEntrada', unit: 'day' } },
              fin: { $dateDiff: { startDate: desde, endDate: '$fechaSalida', unit: 'day' } },
              enServicio: { $in: ['$habitacionId', habitacionesEnServicio] },
            },
          },
        ],
        as: 'reservas',
      },
    },
    { $set: { ocupadas: { $map: { input: { $range: [0, dias] }, as: 'i', in: { $size: ocupanLaNoche('$$i') } } } } },
    {
      $project: {
        _id: 0,
        ocupacionPorNoche: {
          $map: {
            input: { $range: [0, dias] },
            as: 'i',
            in: {
              fecha: { $dateToString: { format: '%Y-%m-%d', date: { $dateAdd: { startDate: desde, unit: 'day', amount: '$$i' } } } },
              ocupadas: { $arrayElemAt: ['$ocupadas', '$$i'] },
              enServicio,
              porcentaje: porcentaje({ $arrayElemAt: ['$ocupadas', '$$i'] }, divisor),
            },
          },
        },
        resumen: {
          ocupacionPeriodo: porcentaje({ $sum: '$ocupadas' }, divisor * dias),
          libresEstaNoche: { $subtract: [enServicio, { $size: ocupadasEstaNoche }] },
          // En un $project un número suelto significa "incluir el campo", no "valor": va como literal.
          enServicio: { $literal: enServicio },
          llegadasHoy: contarReservas({ $and: [{ $eq: ['$$r.ini', indiceHoy] }, { $in: ['$$r.estado', ['pendiente', 'confirmada']] }] }),
          salidasHoy: contarReservas({ $eq: ['$$r.fin', indiceHoy] }),
        },
      },
    },
  ]);
  return calculo;
}

export async function obtenerCalendario({ hotelId, desde = lunesDeLaSemana(obtenerHoy()), dias, tipo }) {
  const hotel = await Hotel.findById(hotelId).select('nombre direccion.ciudad');
  if (!hotel) throw noEncontrado('Hotel no encontrado');

  const habitaciones = await Habitacion.find({ hotelId, ...(tipo && { tipo }) })
    .select('numero tipo capacidad precioNoche estado activo')
    .lean();
  habitaciones.sort(porTipoYNumero);

  const habitacionIds = habitaciones.map((habitacion) => habitacion._id);
  const habitacionesEnServicio = habitaciones.filter(estaEnServicio).map((habitacion) => habitacion._id);

  const [reservas, calculo] = await Promise.all([
    reservasDelRango(habitacionIds, desde, sumarDias(desde, dias)),
    calcularOcupacion({ hotelId: hotel._id, habitacionIds, habitacionesEnServicio, desde, dias }),
  ]);

  return {
    hotel: { _id: hotel._id, nombre: hotel.nombre, ciudad: hotel.direccion.ciudad },
    rango: { desde: formatearFecha(desde), hasta: formatearFecha(sumarDias(desde, dias - 1)), dias },
    habitaciones,
    reservas,
    ...calculo,
  };
}
