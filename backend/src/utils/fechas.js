// Las fechas de entrada y salida se guardan como medianoche UTC; "hoy" se calcula en hora de Bogotá.
const MS_POR_DIA = 24 * 60 * 60 * 1000;
const formateadorBogota = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' });

// Día calendario que marca un instante en Bogotá, como medianoche UTC (igual que las fechas de reserva).
export const diaEnBogota = (instante) => new Date(`${formateadorBogota.format(instante)}T00:00:00.000Z`);

export const obtenerHoy = () => diaEnBogota(new Date());

export function sumarDias(fecha, dias) {
  return new Date(fecha.getTime() + dias * MS_POR_DIA);
}

// Lunes de la semana que contiene `dia` (el domingo cuenta como último día de la semana).
export const lunesDeLaSemana = (dia) => sumarDias(dia, -((dia.getUTCDay() + 6) % 7));

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
