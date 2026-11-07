const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LONGITUD_SUFIJO = 8;

export function generarCodigoReserva(aleatorio = Math.random) {
  let sufijo = '';
  for (let i = 0; i < LONGITUD_SUFIJO; i++) {
    sufijo += ALFABETO[Math.floor(aleatorio() * ALFABETO.length)];
  }
  return `SH-${sufijo}`;
}
