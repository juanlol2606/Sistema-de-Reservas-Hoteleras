const iniciales = (nombre = '') =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('');

export default function Avatar({ nombre, grande = false }) {
  return (
    <span className={`avatar${grande ? ' avatar-grande' : ''}`} aria-hidden="true">
      {iniciales(nombre)}
    </span>
  );
}
