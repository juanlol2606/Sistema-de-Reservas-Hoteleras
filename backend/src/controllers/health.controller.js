import { estadoConexion } from '../config/db.js';

export function consultarSalud(req, res) {
  const baseDeDatos = estadoConexion();
  const operativo = baseDeDatos === 'conectada';

  res.status(operativo ? 200 : 503).json({
    estado: operativo ? 'ok' : 'degradado',
    baseDeDatos,
    uptimeSegundos: Math.round(process.uptime()),
    fecha: new Date().toISOString(),
  });
}
