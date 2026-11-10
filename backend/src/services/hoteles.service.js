import Habitacion from '../models/Habitacion.js';
import Hotel from '../models/Hotel.js';
import { noEncontrado } from '../utils/errores.js';
import { paginar } from '../utils/paginacion.js';
import { coincidenciaParcial } from '../utils/texto.js';
import { borrarImagenesRemotas } from './cloudinary.service.js';
import { exigirSinReservas } from './integridad.service.js';

export function listarHoteles({ ciudad, estrellas, q, activo, page, limit }) {
  const filtro = {};
  if (ciudad) filtro['direccion.ciudad'] = ciudad;
  if (estrellas) filtro.estrellas = estrellas;
  if (q) filtro.nombre = coincidenciaParcial(q);
  if (activo !== undefined) filtro.activo = activo;

  return paginar({ Modelo: Hotel, filtro, orden: { nombre: 1 }, page, limit });
}

export async function obtenerHotel(id) {
  const hotel = await Hotel.findById(id);
  if (!hotel) throw noEncontrado('Hotel no encontrado');
  return hotel;
}

export function crearHotel(datos) {
  return Hotel.create(datos);
}

export async function actualizarHotel(id, datos) {
  const hotel = await obtenerHotel(id);
  hotel.set(datos);
  return hotel.save();
}

export async function eliminarHotel(id) {
  const hotel = await obtenerHotel(id);
  await exigirSinReservas({ hotelId: hotel._id }, 'el hotel');
  const habitaciones = await Habitacion.find({ hotelId: hotel._id }).select('imagenes');
  await Habitacion.deleteMany({ hotelId: hotel._id });
  await hotel.deleteOne();
  await borrarImagenesRemotas([...hotel.imagenes, ...habitaciones.flatMap((habitacion) => habitacion.imagenes)]);
}
