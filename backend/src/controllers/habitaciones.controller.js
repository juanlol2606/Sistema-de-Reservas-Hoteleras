import { listarDisponibles } from '../services/disponibilidad.service.js';
import * as habitaciones from '../services/habitaciones.service.js';

export async function disponibles(req, res) {
  res.json(await listarDisponibles(req.validado.query));
}

export async function listar(req, res) {
  res.json(await habitaciones.listarHabitaciones(req.validado.query));
}

export async function obtener(req, res) {
  res.json(await habitaciones.obtenerHabitacion(req.validado.params.id));
}

export async function crear(req, res) {
  res.status(201).json(await habitaciones.crearHabitacion(req.validado.body));
}

export async function actualizar(req, res) {
  res.json(await habitaciones.actualizarHabitacion(req.validado.params.id, req.validado.body));
}

export async function eliminar(req, res) {
  await habitaciones.eliminarHabitacion(req.validado.params.id);
  res.status(204).end();
}
