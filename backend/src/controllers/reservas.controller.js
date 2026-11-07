import * as reservas from '../services/reservas.service.js';

export async function listar(req, res) {
  res.json(await reservas.listarReservas(req.validado.query));
}

export async function obtener(req, res) {
  res.json(await reservas.obtenerReserva(req.validado.params.id));
}

export async function crear(req, res) {
  res.status(201).json(await reservas.crearReserva(req.validado.body));
}

export async function actualizar(req, res) {
  res.json(await reservas.actualizarReserva(req.validado.params.id, req.validado.body));
}

export async function cambiarEstado(req, res) {
  res.json(await reservas.cambiarEstado(req.validado.params.id, req.validado.body.estado));
}

export async function registrarPago(req, res) {
  res.status(201).json(await reservas.registrarPago(req.validado.params.id, req.validado.body));
}

export async function eliminar(req, res) {
  await reservas.eliminarReserva(req.validado.params.id);
  res.status(204).end();
}
