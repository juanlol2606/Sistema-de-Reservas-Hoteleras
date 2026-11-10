import { LIMITE_POR_PAGINA } from '../hooks/useListado.js';
import Boton from './Boton.jsx';

// `mostrarTotal` se apaga cuando la pantalla ya muestra el número de resultados sobre el listado.
export default function Paginacion({ pagina, total, alCambiar, mostrarTotal = true }) {
  const paginas = Math.max(1, Math.ceil(total / LIMITE_POR_PAGINA));

  return (
    <nav className="paginacion" aria-label="Paginación">
      <span>
        {mostrarTotal && `${total} ${total === 1 ? 'resultado' : 'resultados'}`}
      </span>
      <div className="paginacion-controles">
        <Boton onClick={() => alCambiar(pagina - 1)} disabled={pagina <= 1}>
          ← Anterior
        </Boton>
        <span>
          Página {pagina} de {paginas}
        </span>
        <Boton onClick={() => alCambiar(pagina + 1)} disabled={pagina >= paginas}>
          Siguiente →
        </Boton>
      </div>
    </nav>
  );
}
