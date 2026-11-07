import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ titulo, alCerrar, ancho = 'normal', children }) {
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
    <div className="modal-fondo" onMouseDown={(evento) => evento.target === evento.currentTarget && alCerrar()}>
      <div className={`modal modal-${ancho}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <header className="modal-encabezado">
          <h2>{titulo}</h2>
          <button type="button" className="boton-icono" onClick={alCerrar} aria-label="Cerrar">
            ×
          </button>
        </header>
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
