import { useState } from 'react';
import { describirError } from '../api/errores.js';
import AlertaError from './AlertaError.jsx';
import Modal from './Modal.jsx';

// Diálogo de confirmación. Si la acción falla muestra el error y, si existe, ofrece una acción alternativa
// (por ejemplo "Desactivar" cuando la API no deja eliminar).
export default function ConfirmarAccion({ titulo, mensaje, textoConfirmar = 'Confirmar', peligro = false, alConfirmar, alCancelar, alternativa }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const ejecutar = async (accion) => {
    setEnviando(true);
    setError(null);
    try {
      await accion();
    } catch (fallo) {
      setError(describirError(fallo));
      setEnviando(false);
    }
  };

  return (
    <Modal titulo={titulo} alCerrar={alCancelar} ancho="angosto">
      <p>{mensaje}</p>
      <AlertaError error={error && alternativa ? { ...error, detalle: null } : error} />
      <div className="acciones">
        <button type="button" className="boton" onClick={alCancelar} disabled={enviando}>
          Cancelar
        </button>
        {error && alternativa && (
          <button type="button" className="boton boton-primario" onClick={() => ejecutar(alternativa.ejecutar)} disabled={enviando}>
            {alternativa.texto}
          </button>
        )}
        <button
          type="button"
          className={`boton ${peligro ? 'boton-peligro' : 'boton-primario'}`}
          onClick={() => ejecutar(alConfirmar)}
          disabled={enviando}
        >
          {enviando ? 'Procesando…' : textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
