const formatoPesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const formatoDiaBogota = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' });
const MS_POR_DIA = 24 * 60 * 60 * 1000;

const formatoMillones = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const formatoPorcentaje = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatearPesos = (monto) => formatoPesos.format(monto ?? 0);

// "20,5 M" para millones y "850 mil" para lo demás: cabe en las etiquetas de las gráficas.
export const abreviarPesos = (valor) => {
  if (valor >= 1_000_000) return `${formatoMillones.format(valor / 1_000_000)} M`;
  return valor >= 1000 ? `${Math.round(valor / 1000)} mil` : String(valor);
};

export const formatearPorcentaje = (valor) => `${formatoPorcentaje.format(valor)} %`;

const crearFormateadorDeDia = (zona) => {
  const formato = new Intl.DateTimeFormat('es-CO', { timeZone: zona, day: 'numeric', month: 'short', year: 'numeric' });
  return (iso) =>
    formato
      .formatToParts(new Date(iso))
      .filter((parte) => parte.type !== 'literal')
      .map((parte) => parte.value)
      .join(' ');
};

// Las fechas de reserva llegan como medianoche UTC: se muestran en UTC para que no retrocedan un día. Resultado: "5 ene 2027".
export const formatearFecha = crearFormateadorDeDia('UTC');

// Para instantes (por ejemplo, la emisión de la factura): el día que marca el reloj de Bogotá.
export const formatearDiaBogota = crearFormateadorDeDia('America/Bogota');

export const formatearFechaHora = (iso) =>
  new Date(iso).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });

export const formatearMes = (mes) => {
  const [anio, numero] = mes.split('-').map(Number);
  return new Date(Date.UTC(anio, numero - 1, 1)).toLocaleDateString('es-CO', { timeZone: 'UTC', month: 'short', year: '2-digit' });
};

// "abr 26": cabe bajo una columna de gráfica.
export const formatearMesCorto = (mes) => formatearMes(mes).replace(' de ', ' ');

export const aValorDeFecha = (iso) => iso.slice(0, 10);

export const hoyEnBogota = () => formatoDiaBogota.format(new Date());

export const diasEntre = (entrada, salida) => Math.round((Date.parse(salida) - Date.parse(entrada)) / MS_POR_DIA);

export function sumarDiasATexto(fecha, dias) {
  return new Date(Date.parse(fecha) + dias * MS_POR_DIA).toISOString().slice(0, 10);
}

const DIAS_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const numeroDeDiaSemana = (fecha) => new Date(`${fecha}T00:00:00Z`).getUTCDay();
const partesDeFecha = (fecha) => {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return { anio, dia, mes: MESES_CORTOS[mes - 1] };
};

export const diaDeLaSemana = (fecha) => DIAS_SEMANA[numeroDeDiaSemana(fecha)];
export const esFinDeSemana = (fecha) => [0, 6].includes(numeroDeDiaSemana(fecha));

// Lunes de la semana de `fecha` (AAAA-MM-DD); el domingo cuenta como último día de la semana.
export const lunesDeLaSemana = (fecha) => sumarDiasATexto(fecha, -((numeroDeDiaSemana(fecha) + 6) % 7));

// "lun 9 nov"
export const formatearDiaCorto = (fecha) => {
  const { dia, mes } = partesDeFecha(fecha);
  return `${diaDeLaSemana(fecha)} ${dia} ${mes}`;
};

// "9 – 22 nov 2026"; si el rango cruza de mes o de año, repite lo que cambia.
export function describirRango(desde, hasta) {
  const inicio = partesDeFecha(desde);
  const fin = partesDeFecha(hasta);
  if (inicio.anio !== fin.anio) return `${inicio.dia} ${inicio.mes} ${inicio.anio} – ${fin.dia} ${fin.mes} ${fin.anio}`;
  if (inicio.mes !== fin.mes) return `${inicio.dia} ${inicio.mes} – ${fin.dia} ${fin.mes} ${fin.anio}`;
  return `${inicio.dia} – ${fin.dia} ${fin.mes} ${fin.anio}`;
}

export const recortarTextos = (objeto) =>
  Object.fromEntries(Object.entries(objeto).map(([clave, valor]) => [clave, typeof valor === 'string' ? valor.trim() : valor]));

export const separarPorComas = (texto) =>
  texto
    .split(',')
    .map((parte) => parte.trim())
    .filter(Boolean);

export const quitarVacios = (objeto) =>
  Object.fromEntries(Object.entries(objeto).filter(([, valor]) => valor !== '' && valor != null));
