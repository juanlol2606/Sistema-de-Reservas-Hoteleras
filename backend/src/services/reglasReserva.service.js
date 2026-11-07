import { conflicto, solicitudInvalida } from '../utils/errores.js';
import { obtenerHoy } from '../utils/fechas.js';

// Regla 2: la salida es posterior a la entrada y la entrada no está en el pasado.
export function validarFechas(entrada, salida) {
  const problemas = [];
  if (salida <= entrada) problemas.push({ campo: 'fechaSalida', mensaje: 'debe ser posterior a la fecha de entrada' });
  if (entrada < obtenerHoy()) problemas.push({ campo: 'fechaEntrada', mensaje: 'no puede ser anterior a hoy' });
  if (problemas.length) throw solicitudInvalida('Datos inválidos', problemas);
}

// Regla 3: no caben más huéspedes que la capacidad de la habitación.
export function validarCapacidad(numHuespedes, habitacion) {
  if (numHuespedes <= habitacion.capacidad) return;
  throw solicitudInvalida('Datos inválidos', [
    { campo: 'numHuespedes', mensaje: `la habitación ${habitacion.numero} admite máximo ${habitacion.capacidad}` },
  ]);
}

// Regla 4: no se reserva una habitación en mantenimiento ni de un hotel inactivo (ni inactiva o de un huésped inactivo).
export function validarReservable({ hotel, habitacion }) {
  if (!hotel.activo) throw conflicto('El hotel está inactivo', `${hotel.nombre} no recibe reservas`);
  if (!habitacion.activo) throw conflicto('La habitación está inactiva', `La habitación ${habitacion.numero} no recibe reservas`);
  if (habitacion.estado === 'mantenimiento') {
    throw conflicto('La habitación está en mantenimiento', `La habitación ${habitacion.numero} no está disponible`);
  }
}

export function validarHuespedActivo(huesped) {
  if (!huesped.activo) throw conflicto('El huésped está inactivo', `${huesped.nombre} no puede hacer reservas`);
}
