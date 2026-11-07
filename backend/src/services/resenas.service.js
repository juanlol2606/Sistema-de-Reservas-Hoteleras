import Hotel from '../models/Hotel.js';
import Reserva from '../models/Reserva.js';
import Resena from '../models/Resena.js';
import { conflicto, noEncontrado } from '../utils/errores.js';
import { paginar } from '../utils/paginacion.js';

const POBLAR = [
  { path: 'huesped', select: 'nombre' },
  { path: 'hotel', select: 'nombre' },
  { path: 'reserva', select: 'codigo' },
];

export function listarResenas({ hotelId, huespedId, reservaId, page, limit }) {
  const filtro = {};
  if (hotelId) filtro.hotelId = hotelId;
  if (huespedId) filtro.huespedId = huespedId;
  if (reservaId) filtro.reservaId = reservaId;

  return paginar({ Modelo: Resena, filtro, orden: { fecha: -1, _id: -1 }, page, limit, populate: POBLAR });
}

async function buscarResena(id) {
  const resena = await Resena.findById(id);
  if (!resena) throw noEncontrado('Reseña no encontrada');
  return resena;
}

export async function obtenerResena(id) {
  return (await buscarResena(id)).populate(POBLAR);
}

// Regla 8: solo se reseña una reserva finalizada, una sola vez.
export async function crearResena({ reservaId, puntuacion, comentario }) {
  const reserva = await Reserva.findById(reservaId);
  if (!reserva) throw noEncontrado('Reserva no encontrada');
  if (reserva.estado !== 'finalizada') {
    throw conflicto('Solo se puede reseñar una reserva finalizada', `La reserva ${reserva.codigo} está ${reserva.estado}`);
  }
  if (await Resena.exists({ reservaId })) {
    throw conflicto('Esa reserva ya tiene una reseña', `Reserva ${reserva.codigo}`);
  }

  const resena = await Resena.create({
    reservaId,
    hotelId: reserva.hotelId,
    huespedId: reserva.huespedId,
    puntuacion,
    comentario,
  });
  await recalcularCalificacionPromedio(reserva.hotelId);
  return resena.populate(POBLAR);
}

export async function eliminarResena(id) {
  const resena = await buscarResena(id);
  await resena.deleteOne();
  await recalcularCalificacionPromedio(resena.hotelId);
}

// Regla 8: tras cada cambio en las reseñas se recalcula el promedio del hotel (dos decimales).
async function recalcularCalificacionPromedio(hotelId) {
  const [resultado] = await Resena.aggregate([
    { $match: { hotelId } },
    { $group: { _id: null, promedio: { $avg: '$puntuacion' } } },
  ]);
  const calificacionPromedio = resultado ? Math.round(resultado.promedio * 100) / 100 : 0;
  await Hotel.updateOne({ _id: hotelId }, { calificacionPromedio });
}
