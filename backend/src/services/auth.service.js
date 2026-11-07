import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import Usuario from '../models/Usuario.js';
import { noAutorizado } from '../utils/errores.js';

export async function iniciarSesion({ email, password }) {
  const usuario = await Usuario.findOne({ email }).select('+passwordHash');
  const credencialesValidas = usuario && (await bcrypt.compare(password, usuario.passwordHash));
  if (!credencialesValidas) throw noAutorizado('Credenciales inválidas');

  const token = jwt.sign({ email: usuario.email, rol: usuario.rol }, config.jwtSecret, {
    subject: usuario.id,
    expiresIn: config.jwtExpiracion,
  });
  return { token, usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol } };
}
