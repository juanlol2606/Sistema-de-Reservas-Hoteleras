// Fila de chips para filtrar por una opción. Recibe las mismas propiedades que devuelve `listado.filtro(...)`.
// Con `conTodos={false}` no se dibuja el chip que quita el filtro (siempre hay una opción elegida).
export default function ChipsFiltro({ etiqueta, opciones, valor, alCambiar, textoTodos = 'Todos', conTodos = true }) {
  const todas = conTodos ? [{ valor: '', etiqueta: textoTodos }, ...opciones] : opciones;

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
