import Huesped from '../models/Huesped.js';
import { noEncontrado } from '../utils/errores.js';
import { paginar } from '../utils/paginacion.js';
import { coincidenciaParcial } from '../utils/texto.js';
import { exigirSinReservas } from './integridad.service.js';

export function listarHuespedes({ q, ciudad, activo, page, limit }) {
  const filtro = {};
  if (ciudad) filtro.ciudadOrigen = ciudad;
  if (activo !== undefined) filtro.activo = activo;
  if (q) {
    const coincidencia = coincidenciaParcial(q);
    filtro.$or = [{ nombre: coincidencia }, { email: coincidencia }, { 'documento.numero': coincidencia }];
  }

  return paginar({ Modelo: Huesped, filtro, orden: { nombre: 1 }, page, limit });
}

export async function obtenerHuesped(id) {
  const huesped = await Huesped.findById(id);
  if (!huesped) throw noEncontrado('Huésped no encontrado');
  return huesped;
}

export function crearHuesped(datos) {
  return Huesped.create(datos);
}

export async function actualizarHuesped(id, datos) {
  const huesped = await obtenerHuesped(id);
  huesped.set(datos);
  return huesped.save();
}

export async function eliminarHuesped(id) {
  const huesped = await obtenerHuesped(id);
  await exigirSinReservas({ huespedId: huesped._id }, 'el huésped');
  await huesped.deleteOne();
}
