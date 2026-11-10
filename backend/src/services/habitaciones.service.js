import Habitacion from '../models/Habitacion.js';
import Hotel from '../models/Hotel.js';
import { noEncontrado } from '../utils/errores.js';
import { paginar } from '../utils/paginacion.js';
import { coincidenciaParcial } from '../utils/texto.js';
import { borrarImagenesRemotas } from './cloudinary.service.js';
import { exigirSinReservas } from './integridad.service.js';

// Del hotel solo viaja su portada (la primera foto): alcanza para las miniaturas.
export const POBLAR_HOTEL = { path: 'hotel', select: { nombre: 1, 'direccion.ciudad': 1, imagenes: { $slice: 1 } } };

export function listarHabitaciones({ hotelId, tipo, estado, activo, q, page, limit }) {
  const filtro = {};
  if (hotelId) filtro.hotelId = hotelId;
  if (tipo) filtro.tipo = tipo;
  if (estado) filtro.estado = estado;
  if (activo !== undefined) filtro.activo = activo;
  if (q) filtro.numero = coincidenciaParcial(q);

  return paginar({
    Modelo: Habitacion,
    filtro,
    orden: { hotelId: 1, numero: 1 },
    page,
    limit,
    populate: POBLAR_HOTEL,
  });
}

export async function obtenerHabitacion(id) {
  const habitacion = await Habitacion.findById(id).populate(POBLAR_HOTEL);
  if (!habitacion) throw noEncontrado('Habitación no encontrada');
  return habitacion;
}

export async function crearHabitacion(datos) {
  if (!(await Hotel.exists({ _id: datos.hotelId }))) throw noEncontrado('Hotel no encontrado');
  const habitacion = await Habitacion.create(datos);
  return habitacion.populate(POBLAR_HOTEL);
}

export async function actualizarHabitacion(id, datos) {
  const habitacion = await obtenerHabitacion(id);
  habitacion.set(datos);
  await habitacion.save();
  return habitacion;
}

export async function eliminarHabitacion(id) {
  const habitacion = await obtenerHabitacion(id);
  await exigirSinReservas({ habitacionId: habitacion._id }, 'la habitación');
  await habitacion.deleteOne();
  await borrarImagenesRemotas(habitacion.imagenes);
}
