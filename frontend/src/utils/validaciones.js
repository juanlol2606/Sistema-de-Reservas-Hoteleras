const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_TELEFONO = /^\+?[\d\s()-]{7,20}$/;

export const requerido = (valor) => (String(valor ?? '').trim() ? undefined : 'Es obligatorio');

export const maximo = (valor, largo) => (String(valor ?? '').trim().length > largo ? `Máximo ${largo} caracteres` : undefined);

export const textoObligatorio = (valor, largo = 120) => requerido(valor) ?? maximo(valor, largo);

export const email = (valor) => requerido(valor) ?? (REGEX_EMAIL.test(valor.trim()) ? undefined : 'No es un correo válido');

export const telefono = (valor) => requerido(valor) ?? (REGEX_TELEFONO.test(valor.trim()) ? undefined : 'No es un teléfono válido');

export function entero(valor, minimo, tope) {
  const faltante = requerido(valor);
  if (faltante) return faltante;
  const numero = Number(valor);
  if (!Number.isInteger(numero)) return 'Debe ser un número entero';
  if (numero < minimo) return `Mínimo ${minimo}`;
  if (numero > tope) return `Máximo ${tope}`;
  return undefined;
}

export function numeroPositivo(valor) {
  const faltante = requerido(valor);
  if (faltante) return faltante;
  return Number(valor) > 0 ? undefined : 'Debe ser mayor que 0';
}

// Deja solo los campos con error.
export const conErrores = (errores) => Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje));
