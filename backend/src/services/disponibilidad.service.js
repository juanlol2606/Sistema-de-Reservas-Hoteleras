import Habitacion from '../models/Habitacion.js';
import Hotel from '../models/Hotel.js';
import Reserva from '../models/Reserva.js';
import { conflicto } from '../utils/errores.js';
import { formatearFecha } from '../utils/fechas.js';
import { paginar } from '../utils/paginacion.js';
import { POBLAR_HOTEL } from './habitaciones.service.js';
import { validarFechas } from './reglasReserva.service.js';

// Regla 1: dos reservas no canceladas se traslapan si entrada < otraSalida y salida > otraEntrada.
function filtroDeTraslape({ entrada, salida }) {
  return { estado: { $ne: 'cancelada' }, fechaEntrada: { $lt: salida }, fechaSalida: { $gt: entrada } };
}

export function buscarTraslape({ habitacionId, entrada, salida, excluirReservaId }) {
  const filtro = { habitacionId, ...filtroDeTraslape({ entrada, salida }) };
  if (excluirReservaId) filtro._id = { $ne: excluirReservaId };
  return Reserva.findOne(filtro).select('codigo fechaEntrada fechaSalida');
}

export async function exigirSinTraslape(datos) {
  const choque = await buscarTraslape(datos);
  if (!choque) return;
  throw conflicto(
    'La habitación ya está reservada en esas fechas',
    `Reserva ${choque.codigo}: del ${formatearFecha(choque.fechaEntrada)} al ${formatearFecha(choque.fechaSalida)}`,
  );
}

export async function listarDisponibles({ hotelId, tipo, entrada, salida, precioMin, precioMax, page, limit }) {
  const hotelesInactivos = await Hotel.find({ activo: false }).distinct('_id');
  const filtro = {
    estado: 'disponible',
    activo: true,
    hotelId: hotelId ? { $eq: hotelId, $nin: hotelesInactivos } : { $nin: hotelesInactivos },
  };
  if (tipo) filtro.tipo = tipo;
  if (precioMin !== undefined || precioMax !== undefined) {
    filtro.precioNoche = {
      ...(precioMin !== undefined && { $gte: precioMin }),
      ...(precioMax !== undefined && { $lte: precioMax }),
    };
  }

  if (entrada) {
    validarFechas(entrada, salida);
    filtro._id = { $nin: await Reserva.distinct('habitacionId', filtroDeTraslape({ entrada, salida })) };
  }

  return paginar({
    Modelo: Habitacion,
    filtro,
    orden: { precioNoche: 1, numero: 1 },
    page,
    limit,
    populate: POBLAR_HOTEL,
  });
}
