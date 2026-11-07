import { iniciarSesion } from '../services/auth.service.js';

export async function login(req, res) {
  res.json(await iniciarSesion(req.validado.body));
}
