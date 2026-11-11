import * as calendario from '../services/calendario.service.js';

export async function obtener(req, res) {
  res.json(await calendario.obtenerCalendario(req.validado.query));
}
