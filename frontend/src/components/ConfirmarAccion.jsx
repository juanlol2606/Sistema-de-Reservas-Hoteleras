import { useState } from 'react';
import { describirError } from '../api/errores.js';
import AlertaError from './AlertaError.jsx';
import Boton from './Boton.jsx';
import { IconoAdvertencia } from './Iconos.jsx';
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
    <Modal titulo={titulo} alCerrar={alCancelar} ancho="angosto" alerta>
      {peligro && (
        <span className="confirmacion-icono">
          <IconoAdvertencia width={26} height={26} strokeWidth={1.8} />
        </span>
      )}
      <div className="confirmacion-texto">
        <h2>{titulo}</h2>
        <p>{mensaje}</p>
      </div>
      <AlertaError error={error && alternativa ? { ...error, detalle: null } : error} />
      <div className="acciones">
        <Boton onClick={alCancelar} disabled={enviando}>
          Cancelar
        </Boton>
        {error && alternativa && (
          <Boton variante="dorado" onClick={() => ejecutar(alternativa.ejecutar)} disabled={enviando}>
            {alternativa.texto}
          </Boton>
        )}
        <Boton variante={peligro ? 'peligro' : 'dorado'} onClick={() => ejecutar(alConfirmar)} disabled={enviando}>
          {enviando ? 'Procesando…' : textoConfirmar}
        </Boton>
      </div>
    </Modal>
  );
}
