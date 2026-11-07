// Tabla compacta y plegable con los datos crudos de un reporte (alternativa accesible a la gráfica).
export default function TablaDatos({ columnas, filas }) {
  return (
    <details>
      <summary>Ver datos</summary>
      <div className="tabla-contenedor">
        <table className="tabla">
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
            {filas.map((fila, indice) => (
              <tr key={indice}>
                {columnas.map((columna) => (
                  <td key={columna.titulo} className={columna.clase}>
                    {columna.render(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
