const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const coincidenciaParcial = (texto) => ({ $regex: escaparRegex(texto), $options: 'i' });

const formatoPesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export const formatearPesos = (monto) => formatoPesos.format(monto);

export const pluralizar = (cantidad, singular, plural) => `${cantidad} ${cantidad === 1 ? singular : plural}`;
