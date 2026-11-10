import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { IconoCerrar } from './Iconos.jsx';

// `etiqueta` y `descripcion` son opcionales. Con `alerta` se dibuja el diálogo de confirmación, sin encabezado.
export default function Modal({ titulo, etiqueta, descripcion, alCerrar, ancho = 'normal', alerta = false, children }) {
  const idTitulo = useId();

  useEffect(() => {
    const alTeclear = (evento) => evento.key === 'Escape' && alCerrar();
    document.addEventListener('keydown', alTeclear);
    document.body.classList.add('sin-scroll');
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.classList.remove('sin-scroll');
    };
  }, [alCerrar]);

  return createPortal(
    <div className={`modal-fondo${alerta ? ' modal-fondo-centrado' : ''}`} onMouseDown={(evento) => evento.target === evento.currentTarget && alCerrar()}>
      <div
        className={`modal modal-${ancho}${alerta ? ' modal-alerta' : ''}`}
        role={alerta ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-label={alerta ? titulo : undefined}
        aria-labelledby={alerta ? undefined : idTitulo}
      >
        {!alerta && (
          <header className="modal-encabezado">
            <div className="modal-titulos">
              {etiqueta && <span className="etiqueta-dorada etiqueta-pequena">{etiqueta}</span>}
              <h2 id={idTitulo}>{titulo}</h2>
              {descripcion && <p>{descripcion}</p>}
            </div>
            <button type="button" className="modal-cerrar" onClick={alCerrar} aria-label="Cerrar">
              <IconoCerrar width={18} height={18} />
            </button>
          </header>
        )}
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
