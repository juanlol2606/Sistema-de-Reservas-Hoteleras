import * as huespedes from '../services/huespedes.service.js';

export async function listar(req, res) {
  res.json(await huespedes.listarHuespedes(req.validado.query));
}

export async function obtener(req, res) {
  res.json(await huespedes.obtenerHuesped(req.validado.params.id));
}

export async function crear(req, res) {
  res.status(201).json(await huespedes.crearHuesped(req.validado.body));
}

export async function actualizar(req, res) {
  res.json(await huespedes.actualizarHuesped(req.validado.params.id, req.validado.body));
}

export async function eliminar(req, res) {
  await huespedes.eliminarHuesped(req.validado.params.id);
  res.status(204).end();
}
