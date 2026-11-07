import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { noAutorizado } from '../utils/errores.js';

// Exige "Authorization: Bearer <token>" y deja el usuario en req.usuario.
export function requerirAuth(req, res, next) {
  const [esquema, token] = (req.headers.authorization ?? '').split(' ');
  if (esquema !== 'Bearer' || !token) {
    throw noAutorizado('Falta el token de autenticación', 'Envía el encabezado Authorization: Bearer <token>');
  }

  const secreto = config.jwtSecret;
  try {
    const { sub, email, rol } = jwt.verify(token, secreto, { algorithms: ['HS256'] });
    req.usuario = { id: sub, email, rol };
  } catch {
    throw noAutorizado('Token inválido o expirado', 'Inicia sesión de nuevo');
  }
  next();
}
