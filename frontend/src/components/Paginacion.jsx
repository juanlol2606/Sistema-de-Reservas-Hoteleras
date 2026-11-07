import { LIMITE_POR_PAGINA } from '../hooks/useListado.js';

export default function Paginacion({ pagina, total, alCambiar }) {
  const paginas = Math.max(1, Math.ceil(total / LIMITE_POR_PAGINA));

  return (
    <nav className="paginacion" aria-label="Paginación">
      <span>
        {total} {total === 1 ? 'resultado' : 'resultados'}
      </span>
      <div className="paginacion-controles">
        <button type="button" className="boton" onClick={() => alCambiar(pagina - 1)} disabled={pagina <= 1}>
          Anterior
        </button>
        <span>
          Página {pagina} de {paginas}
        </span>
        <button type="button" className="boton" onClick={() => alCambiar(pagina + 1)} disabled={pagina >= paginas}>
          Siguiente
        </button>
      </div>
    </nav>
  );
}
