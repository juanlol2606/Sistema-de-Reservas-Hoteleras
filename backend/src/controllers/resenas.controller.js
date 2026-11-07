import * as resenas from '../services/resenas.service.js';

export async function listar(req, res) {
  res.json(await resenas.listarResenas(req.validado.query));
}

export async function obtener(req, res) {
  res.json(await resenas.obtenerResena(req.validado.params.id));
}

export async function crear(req, res) {
  res.status(201).json(await resenas.crearResena(req.validado.body));
}

export async function eliminar(req, res) {
  await resenas.eliminarResena(req.validado.params.id);
  res.status(204).end();
}
