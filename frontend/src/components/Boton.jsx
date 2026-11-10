import { Link } from 'react-router-dom';

// variante: dorado | oscuro | secundario | peligro | contorno-peligro | sobre-oscuro | accion | accion-dorado | accion-exito | accion-peligro.
// Con `a` se dibuja un enlace de React Router con el mismo aspecto.
export default function Boton({ variante = 'secundario', bloque = false, a, className = '', type = 'button', ...resto }) {
  const clases = `boton boton-${variante}${bloque ? ' boton-bloque' : ''} ${className}`.trim();
  if (a) return <Link to={a} className={clases} {...resto} />;
  return <button type={type} className={clases} {...resto} />;
}
