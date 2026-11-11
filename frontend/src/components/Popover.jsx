import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const SEPARACION = 12;
const MARGEN = 8;

// Posición del clic para abrir un popover; con el teclado (detail 0) cae justo debajo del elemento.
export function posicionDelClic(evento) {
  if (evento.detail !== 0) return { x: evento.clientX, y: evento.clientY };
  const { left, bottom } = evento.currentTarget.getBoundingClientRect();
  return { x: left, y: bottom };
}

// Ventana flotante junto al punto (x, y) de la pantalla, siempre dentro de ella. Se cierra con Escape, al hacer clic fuera o al hacer scroll.
export default function Popover({ x, y, etiqueta, alCerrar, children }) {
  const ventana = useRef(null);
  const [posicion, setPosicion] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    const { width, height } = ventana.current.getBoundingClientRect();
    setPosicion({
      left: Math.max(MARGEN, Math.min(x + SEPARACION, window.innerWidth - width - MARGEN)),
      top: Math.max(MARGEN, Math.min(y + SEPARACION, window.innerHeight - height - MARGEN)),
    });
  }, [x, y]);

  useEffect(() => ventana.current.focus(), []);

  useEffect(() => {
    const alTeclear = (evento) => evento.key === 'Escape' && alCerrar();
    const alPulsarFuera = (evento) => !ventana.current.contains(evento.target) && alCerrar();
    document.addEventListener('keydown', alTeclear);
    document.addEventListener('mousedown', alPulsarFuera);
    document.addEventListener('scroll', alCerrar, true);
    window.addEventListener('resize', alCerrar);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.removeEventListener('mousedown', alPulsarFuera);
      document.removeEventListener('scroll', alCerrar, true);
      window.removeEventListener('resize', alCerrar);
    };
  }, [alCerrar]);

  return createPortal(
    <div ref={ventana} className="popover" role="dialog" aria-label={etiqueta} tabIndex={-1} style={posicion}>
      {children}
    </div>,
    document.body,
  );
}
