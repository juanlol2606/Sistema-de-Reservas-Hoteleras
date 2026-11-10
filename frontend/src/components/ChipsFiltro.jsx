// Fila de chips para filtrar por una opción. Recibe las mismas propiedades que devuelve `listado.filtro(...)`.
export default function ChipsFiltro({ etiqueta, opciones, valor, alCambiar, textoTodos = 'Todos' }) {
  const todas = [{ valor: '', etiqueta: textoTodos }, ...opciones];

  return (
    <div className="chips" role="group" aria-label={etiqueta}>
      {todas.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          className={`chip${valor === opcion.valor ? ' chip-activo' : ''}`}
          aria-pressed={valor === opcion.valor}
          onClick={() => alCambiar(opcion.valor)}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}
