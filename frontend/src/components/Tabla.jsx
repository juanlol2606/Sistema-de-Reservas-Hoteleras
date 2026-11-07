import AlertaError from './AlertaError.jsx';

// `columnas`: [{ titulo, render(fila), clase }]. Maneja los estados de carga, error y vacío.
export default function Tabla({ columnas, filas, cargando, error, textoVacio = 'No hay resultados con estos filtros.' }) {
  return (
    <div className="tabla-bloque">
      <AlertaError error={error} />
      <div className="tabla-contenedor">
        <table className={`tabla ${cargando ? 'tabla-cargando' : ''}`}>
          <thead>
            <tr>
              {columnas.map((columna) => (
                <th key={columna.titulo} className={columna.clase}>
                  {columna.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila._id}>
                {columnas.map((columna) => (
                  <td key={columna.titulo} className={columna.clase} data-etiqueta={columna.titulo}>
                    <div className="celda">{columna.render(fila)}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!cargando && !error && filas.length === 0 && <p className="vacio">{textoVacio}</p>}
        {cargando && filas.length === 0 && <p className="vacio">Cargando…</p>}
      </div>
    </div>
  );
}
