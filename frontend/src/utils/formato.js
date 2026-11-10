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

const formatoFecha = new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });

// Las fechas de reserva llegan como medianoche UTC: se muestran en UTC para que no retrocedan un día. Resultado: "5 ene 2027".
export const formatearFecha = (iso) =>
  formatoFecha
    .formatToParts(new Date(iso))
    .filter((parte) => parte.type !== 'literal')
    .map((parte) => parte.value)
    .join(' ');

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

export const recortarTextos = (objeto) =>
  Object.fromEntries(Object.entries(objeto).map(([clave, valor]) => [clave, typeof valor === 'string' ? valor.trim() : valor]));

export const separarPorComas = (texto) =>
  texto
    .split(',')
    .map((parte) => parte.trim())
    .filter(Boolean);

export const quitarVacios = (objeto) =>
  Object.fromEntries(Object.entries(objeto).filter(([, valor]) => valor !== '' && valor != null));
