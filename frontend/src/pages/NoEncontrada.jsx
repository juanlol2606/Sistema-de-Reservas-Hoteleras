import { Link } from 'react-router-dom';

export default function NoEncontrada() {
  return (
    <div className="panel">
      <h1>Página no encontrada</h1>
      <p className="descripcion">La dirección que buscas no existe.</p>
      <p>
        <Link to="/">Volver al inicio</Link>
      </p>
    </div>
  );
}
