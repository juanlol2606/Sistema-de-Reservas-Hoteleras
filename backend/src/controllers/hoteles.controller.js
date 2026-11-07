import * as hoteles from '../services/hoteles.service.js';

export async function listar(req, res) {
  res.json(await hoteles.listarHoteles(req.validado.query));
}

export async function obtener(req, res) {
  res.json(await hoteles.obtenerHotel(req.validado.params.id));
}

export async function crear(req, res) {
  res.status(201).json(await hoteles.crearHotel(req.validado.body));
}

export async function actualizar(req, res) {
  res.json(await hoteles.actualizarHotel(req.validado.params.id, req.validado.body));
}

export async function eliminar(req, res) {
  await hoteles.eliminarHotel(req.validado.params.id);
  res.status(204).end();
}
