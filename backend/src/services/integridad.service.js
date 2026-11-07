import Reserva, { ESTADOS_ACTIVOS } from '../models/Reserva.js';
import { conflicto } from '../utils/errores.js';
import { pluralizar } from '../utils/texto.js';

// Regla 9: lo que tiene reservas, activas o históricas, no se elimina: se desactiva.
export async function exigirSinReservas(filtroReservas, entidad) {
  const [total, activas] = await Promise.all([
    Reserva.countDocuments(filtroReservas),
    Reserva.countDocuments({ ...filtroReservas, estado: { $in: ESTADOS_ACTIVOS } }),
  ]);
  if (total === 0) return;

  throw conflicto(
    `No se puede eliminar ${entidad}: tiene ${pluralizar(total, 'reserva', 'reservas')} (${pluralizar(activas, 'activa', 'activas')})`,
    'Desactiva el registro con PATCH enviando { "activo": false }',
  );
}
