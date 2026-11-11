import { diaEnBogota } from './fechas.js';
import { formatearPesos, pluralizar } from './texto.js';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const ABREVIATURA_MES = 3;

const ETIQUETAS_METODO = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', pse: 'PSE' };

const mayusculaInicial = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
const partesDe = (dia) => ({ dia: dia.getUTCDate(), mes: MESES[dia.getUTCMonth()], anio: dia.getUTCFullYear() });

// "$ 840.000": Intl separa el símbolo con un espacio duro que el PDF no necesita.
export const formatearDinero = (monto) => formatearPesos(monto).replace(/\s/g, ' ');

// "4 nov 2026". Los instantes (emisión, pagos) se leen en hora de Bogotá.
export function formatearDiaCorto(instante) {
  const { dia, mes, anio } = partesDe(diaEnBogota(instante));
  return `${dia} ${mes.slice(0, ABREVIATURA_MES)} ${anio}`;
}

// "Del 1 al 4 de noviembre de 2026". Las fechas de la estadía ya son días completos (medianoche UTC).
export function describirPeriodo(entrada, salida) {
  const desde = partesDe(entrada);
  const hasta = partesDe(salida);
  if (desde.anio !== hasta.anio) return `Del ${desde.dia} de ${desde.mes} de ${desde.anio} al ${hasta.dia} de ${hasta.mes} de ${hasta.anio}`;
  if (desde.mes !== hasta.mes) return `Del ${desde.dia} de ${desde.mes} al ${hasta.dia} de ${hasta.mes} de ${hasta.anio}`;
  return `Del ${desde.dia} al ${hasta.dia} de ${hasta.mes} de ${hasta.anio}`;
}

export const describirHuespedes = (cantidad) => pluralizar(cantidad, 'huésped', 'huéspedes');
export const etiquetaMetodo = (metodo) => ETIQUETAS_METODO[metodo] ?? mayusculaInicial(metodo);
export const etiquetaEstado = (estado) => mayusculaInicial(estado.replace('_', ' '));
export const etiquetaTipo = mayusculaInicial;
