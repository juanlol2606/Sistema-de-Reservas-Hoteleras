// Las fechas de entrada y salida se guardan como medianoche UTC; "hoy" se calcula en hora de Bogotá.
const MS_POR_DIA = 24 * 60 * 60 * 1000;
const formateadorBogota = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' });

export function obtenerHoy() {
  return new Date(`${formateadorBogota.format(new Date())}T00:00:00.000Z`);
}

export function sumarDias(fecha, dias) {
  return new Date(fecha.getTime() + dias * MS_POR_DIA);
}

// Bogotá no tiene horario de verano: su medianoche siempre cae a las 05:00 UTC.
const DESFASE_BOGOTA_MS = 5 * 60 * 60 * 1000;

// Convierte "desde y hasta, días completos en hora de Bogotá" en límites de instante, para campos que guardan hora.
export function limitesDeDias(desde, hasta) {
  return {
    ...(desde && { $gte: new Date(desde.getTime() + DESFASE_BOGOTA_MS) }),
    ...(hasta && { $lt: new Date(sumarDias(hasta, 1).getTime() + DESFASE_BOGOTA_MS) }),
  };
}

export function formatearFecha(fecha) {
  return fecha.toISOString().slice(0, 10);
}

export function diasEntre(inicio, fin) {
  return Math.round((fin.getTime() - inicio.getTime()) / MS_POR_DIA);
}
