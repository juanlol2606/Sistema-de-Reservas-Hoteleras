// Ignora mayúsculas y tildes al comparar textos (ciudad=medellin encuentra "Medellín") y ordena en español.
export const COLACION_ES = { locale: 'es', strength: 1 };

export async function paginar({ Modelo, filtro, orden, page, limit, populate }) {
  let consulta = Modelo.find(filtro)
    .collation(COLACION_ES)
    .sort(orden)
    .skip((page - 1) * limit)
    .limit(limit);
  if (populate) consulta = consulta.populate(populate);

  const [data, total] = await Promise.all([
    consulta,
    Modelo.countDocuments(filtro).collation(COLACION_ES),
  ]);
  return { data, total, page };
}
