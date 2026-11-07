function etiquetaDeCampo(campo) {
  const ultimo = campo.split('.').at(-1).replace(/([A-Z])/g, ' $1').toLowerCase();
  return ultimo.charAt(0).toUpperCase() + ultimo.slice(1);
}

// Muestra un error ya traducido por describirError: título, texto de apoyo y lista por campo.
export default function AlertaError({ error }) {
  if (!error) return null;

  return (
    <div className="alerta alerta-error" role="alert">
      <strong>{error.mensaje}</strong>
      {error.detalle && <p>{error.detalle}</p>}
      {error.detalles.length > 0 && (
        <ul>
          {error.detalles.map(({ campo, mensaje }) => (
            <li key={`${campo}-${mensaje}`}>
              {etiquetaDeCampo(campo)}: {mensaje.charAt(0).toLowerCase() + mensaje.slice(1)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
