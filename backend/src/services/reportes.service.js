import Hotel from '../models/Hotel.js';
import Reserva from '../models/Reserva.js';
import Resena from '../models/Resena.js';
import { solicitudInvalida } from '../utils/errores.js';
import { diasEntre, formatearFecha, limitesDeDias, obtenerHoy, sumarDias } from '../utils/fechas.js';
import { COLACION_ES } from '../utils/paginacion.js';

const ZONA_HORARIA = 'America/Bogota';
const MINIMO_RESENAS_TOP = 3;
const TAMANO_TOP_HOTELES = 5;
const TAMANO_TOP_HUESPEDES = 10;
const DIAS_OCUPACION_POR_DEFECTO = 30;
const MAXIMO_DIAS_OCUPACION = 366;

const NO_CANCELADA = { estado: { $ne: 'cancelada' } };

const porHoteles = (ids) => (ids ? { hotelId: { $in: ids } } : {});
const enRango = (campo, limites) => (Object.keys(limites).length ? { [campo]: limites } : {});

// fechaEntrada no tiene hora: el rango incluye ambos extremos.
const limitesDeFechaEntrada = ({ desde, hasta }) => ({
  ...(desde && { $gte: desde }),
  ...(hasta && { $lte: hasta }),
});

const unirHotel = (campo) => [
  { $lookup: { from: 'hoteles', localField: campo, foreignField: '_id', as: 'hotel' } },
  { $unwind: '$hotel' },
];

const porcentaje = (parte, total) => ({ $round: [{ $multiply: [{ $divide: [parte, total] }, 100] }, 1] });

async function idsDeHotelesDeLaCiudad(ciudad) {
  if (!ciudad) return undefined;
  return Hotel.find({ 'direccion.ciudad': ciudad }).collation(COLACION_ES).distinct('_id');
}

const conFiltros = ({ desde, hasta, ciudad }, data) => ({
  filtros: {
    desde: desde ? formatearFecha(desde) : null,
    hasta: hasta ? formatearFecha(hasta) : null,
    ciudad: ciudad ?? null,
  },
  data,
});

export async function ingresosPorMes(filtros) {
  const hoteles = await idsDeHotelesDeLaCiudad(filtros.ciudad);

  // ¿Cuánto dinero cobró cada hotel en cada mes?
  const data = await Reserva.aggregate([
    { $match: porHoteles(hoteles) },
    { $unwind: '$pagos' },
    { $match: enRango('pagos.fecha', limitesDeDias(filtros.desde, filtros.hasta)) },
    {
      $group: {
        _id: {
          hotelId: '$hotelId',
          mes: { $dateToString: { format: '%Y-%m', date: '$pagos.fecha', timezone: ZONA_HORARIA } },
        },
        ingresos: { $sum: '$pagos.monto' },
        pagos: { $sum: 1 },
      },
    },
    ...unirHotel('_id.hotelId'),
    {
      $project: {
        _id: 0,
        mes: '$_id.mes',
        hotelId: '$_id.hotelId',
        hotel: '$hotel.nombre',
        ciudad: '$hotel.direccion.ciudad',
        ingresos: 1,
        pagos: 1,
      },
    },
    { $sort: { mes: 1, hotel: 1 } },
  ]);
  return conFiltros(filtros, data);
}

export async function reservasPorCiudad(filtros) {
  // ¿En qué ciudades se concentran las reservas (sin contar las canceladas)?
  const data = await Reserva.aggregate([
    { $match: { ...NO_CANCELADA, ...enRango('fechaEntrada', limitesDeFechaEntrada(filtros)) } },
    { $group: { _id: '$hotelId', reservas: { $sum: 1 }, noches: { $sum: '$noches' }, valorReservado: { $sum: '$total' } } },
    ...unirHotel('_id'),
    {
      $group: {
        _id: '$hotel.direccion.ciudad',
        hoteles: { $sum: 1 },
        reservas: { $sum: '$reservas' },
        noches: { $sum: '$noches' },
        valorReservado: { $sum: '$valorReservado' },
      },
    },
    { $project: { _id: 0, ciudad: '$_id', hoteles: 1, reservas: 1, noches: 1, valorReservado: 1 } },
    { $sort: { reservas: -1, ciudad: 1 } },
  ]);
  return conFiltros(filtros, data);
}

export async function topHoteles(filtros) {
  const hoteles = await idsDeHotelesDeLaCiudad(filtros.ciudad);

  // ¿Cuáles son los hoteles mejor calificados por sus huéspedes (con al menos 3 reseñas)?
  const data = await Resena.aggregate([
    { $match: { ...porHoteles(hoteles), ...enRango('fecha', limitesDeDias(filtros.desde, filtros.hasta)) } },
    { $group: { _id: '$hotelId', promedio: { $avg: '$puntuacion' }, resenas: { $sum: 1 } } },
    { $match: { resenas: { $gte: MINIMO_RESENAS_TOP } } },
    { $sort: { promedio: -1, resenas: -1, _id: 1 } },
    { $limit: TAMANO_TOP_HOTELES },
    ...unirHotel('_id'),
    {
      $project: {
        _id: 0,
        hotelId: '$_id',
        hotel: '$hotel.nombre',
        ciudad: '$hotel.direccion.ciudad',
        estrellas: '$hotel.estrellas',
        promedio: { $round: ['$promedio', 2] },
        resenas: 1,
      },
    },
  ]);
  return conFiltros(filtros, data);
}

export async function tiposHabitacion(filtros) {
  const hoteles = await idsDeHotelesDeLaCiudad(filtros.ciudad);

  // ¿Qué tipos de habitación se venden más y a qué precio medio por noche?
  const data = await Reserva.aggregate([
    { $match: { ...NO_CANCELADA, ...porHoteles(hoteles), ...enRango('fechaEntrada', limitesDeFechaEntrada(filtros)) } },
    {
      $group: {
        _id: '$habitacion.tipo',
        reservas: { $sum: 1 },
        noches: { $sum: '$noches' },
        ventas: { $sum: '$total' },
      },
    },
    {
      $project: {
        _id: 0,
        tipo: '$_id',
        reservas: 1,
        noches: 1,
        ventas: 1,
        precioMedioNoche: { $round: [{ $divide: ['$ventas', '$noches'] }, 0] },
      },
    },
    { $sort: { ventas: -1 } },
  ]);
  return conFiltros(filtros, data);
}

export async function cancelaciones(filtros) {
  const hoteles = await idsDeHotelesDeLaCiudad(filtros.ciudad);

  // ¿Qué porcentaje de las reservas de cada hotel termina cancelado?
  const data = await Reserva.aggregate([
    { $match: { ...porHoteles(hoteles), ...enRango('fechaEntrada', limitesDeFechaEntrada(filtros)) } },
    {
      $group: {
        _id: '$hotelId',
        reservas: { $sum: 1 },
        canceladas: { $sum: { $cond: [{ $eq: ['$estado', 'cancelada'] }, 1, 0] } },
      },
    },
    ...unirHotel('_id'),
    {
      $project: {
        _id: 0,
        hotelId: '$_id',
        hotel: '$hotel.nombre',
        ciudad: '$hotel.direccion.ciudad',
        reservas: 1,
        canceladas: 1,
        tasaCancelacion: { $cond: [{ $eq: ['$reservas', 0] }, 0, porcentaje('$canceladas', '$reservas')] },
      },
    },
    { $sort: { tasaCancelacion: -1, hotel: 1 } },
  ]);
  return conFiltros(filtros, data);
}

export async function topHuespedes(filtros) {
  const hoteles = await idsDeHotelesDeLaCiudad(filtros.ciudad);

  // ¿Qué huéspedes han pagado más en total?
  const data = await Reserva.aggregate([
    { $match: porHoteles(hoteles) },
    { $unwind: '$pagos' },
    { $match: enRango('pagos.fecha', limitesDeDias(filtros.desde, filtros.hasta)) },
    { $group: { _id: '$huespedId', gasto: { $sum: '$pagos.monto' }, reservas: { $addToSet: '$_id' } } },
    { $sort: { gasto: -1, _id: 1 } },
    { $limit: TAMANO_TOP_HUESPEDES },
    { $lookup: { from: 'huespedes', localField: '_id', foreignField: '_id', as: 'huesped' } },
    { $unwind: '$huesped' },
    {
      $project: {
        _id: 0,
        huespedId: '$_id',
        huesped: '$huesped.nombre',
        ciudadOrigen: '$huesped.ciudadOrigen',
        reservas: { $size: '$reservas' },
        gasto: 1,
      },
    },
  ]);
  return conFiltros(filtros, data);
}

export async function pagosPorMetodo(filtros) {
  const hoteles = await idsDeHotelesDeLaCiudad(filtros.ciudad);

  // ¿Por qué medio pagan los huéspedes y cuánto aporta cada uno?
  const data = await Reserva.aggregate([
    { $match: porHoteles(hoteles) },
    { $unwind: '$pagos' },
    { $match: enRango('pagos.fecha', limitesDeDias(filtros.desde, filtros.hasta)) },
    { $group: { _id: '$pagos.metodo', pagos: { $sum: 1 }, monto: { $sum: '$pagos.monto' } } },
    {
      $group: {
        _id: null,
        montoTotal: { $sum: '$monto' },
        metodos: { $push: { metodo: '$_id', pagos: '$pagos', monto: '$monto' } },
      },
    },
    { $unwind: '$metodos' },
    {
      $project: {
        _id: 0,
        metodo: '$metodos.metodo',
        pagos: '$metodos.pagos',
        monto: '$metodos.monto',
        promedio: { $round: [{ $divide: ['$metodos.monto', '$metodos.pagos'] }, 0] },
        participacion: porcentaje('$metodos.monto', '$montoTotal'),
      },
    },
    { $sort: { monto: -1 } },
  ]);
  return conFiltros(filtros, data);
}

// Sin fechas, mide los últimos 30 días hasta hoy. Noches disponibles = habitaciones en servicio × días del rango.
export async function ocupacion(filtros) {
  const hasta = filtros.hasta ?? obtenerHoy();
  const desde = filtros.desde ?? sumarDias(hasta, -(DIAS_OCUPACION_POR_DEFECTO - 1));
  const dias = diasEntre(desde, hasta) + 1;
  if (dias < 1) throw solicitudInvalida('Datos inválidos', [{ campo: 'desde', mensaje: 'no puede ser posterior a hasta' }]);
  if (dias > MAXIMO_DIAS_OCUPACION) {
    throw solicitudInvalida('Datos inválidos', [{ campo: 'desde', mensaje: `el rango no puede superar ${MAXIMO_DIAS_OCUPACION} días` }]);
  }

  const finExclusivo = sumarDias(hasta, 1);
  const ids = await idsDeHotelesDeLaCiudad(filtros.ciudad);

  // ¿Qué porcentaje de las noches disponibles de cada hotel se vendió en el rango?
  const data = await Hotel.aggregate([
    { $match: ids ? { _id: { $in: ids } } : {} },
    {
      $lookup: {
        from: 'habitaciones',
        localField: '_id',
        foreignField: 'hotelId',
        pipeline: [{ $match: { estado: 'disponible', activo: true } }, { $count: 'total' }],
        as: 'inventario',
      },
    },
    {
      $lookup: {
        from: 'reservas',
        localField: '_id',
        foreignField: 'hotelId',
        pipeline: [
          { $match: { ...NO_CANCELADA, fechaEntrada: { $lt: finExclusivo }, fechaSalida: { $gt: desde } } },
          {
            $group: {
              _id: null,
              noches: {
                $sum: {
                  $dateDiff: {
                    startDate: { $max: ['$fechaEntrada', desde] },
                    endDate: { $min: ['$fechaSalida', finExclusivo] },
                    unit: 'day',
                  },
                },
              },
            },
          },
        ],
        as: 'ventas',
      },
    },
    {
      $set: {
        habitaciones: { $ifNull: [{ $first: '$inventario.total' }, 0] },
        nochesVendidas: { $ifNull: [{ $first: '$ventas.noches' }, 0] },
      },
    },
    {
      $project: {
        _id: 0,
        hotelId: '$_id',
        hotel: '$nombre',
        ciudad: '$direccion.ciudad',
        habitaciones: 1,
        nochesDisponibles: { $multiply: ['$habitaciones', dias] },
        nochesVendidas: 1,
        ocupacion: {
          $cond: [{ $eq: ['$habitaciones', 0] }, 0, porcentaje('$nochesVendidas', { $multiply: ['$habitaciones', dias] })],
        },
      },
    },
    { $sort: { ocupacion: -1, hotel: 1 } },
  ]);

  const nochesDisponibles = data.reduce((suma, fila) => suma + fila.nochesDisponibles, 0);
  const nochesVendidas = data.reduce((suma, fila) => suma + fila.nochesVendidas, 0);
  const respuesta = conFiltros({ ...filtros, desde, hasta }, data);
  return {
    ...respuesta,
    filtros: { ...respuesta.filtros, dias },
    total: {
      nochesDisponibles,
      nochesVendidas,
      ocupacion: nochesDisponibles ? Math.round((nochesVendidas / nochesDisponibles) * 1000) / 10 : 0,
    },
  };
}
