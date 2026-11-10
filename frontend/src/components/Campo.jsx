import { useId } from 'react';

// Campo de formulario o de filtro: etiqueta + control + mensaje de error. `opciones` lo convierte en un select.
// `accion` es un botón opcional que se monta dentro del control (por ejemplo, "Mostrar" en la contraseña).
export default function Campo({ etiqueta, nombre, valor, error, alCambiar, tipo = 'text', opciones, textoVacio, ayuda, ancho, accion, ...resto }) {
  const id = `campo-${nombre}-${useId()}`;
  const propiedades = { id, name: nombre, 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-error` : undefined };
  const claseAncho = ancho === 'completo' ? ' campo-completo' : '';
  const mensajeError = error && (
    <small id={`${id}-error`} className="campo-error">
      {error}
    </small>
  );

  if (tipo === 'checkbox') {
    return (
      <div className={`campo campo-casilla${claseAncho}`}>
        <input {...propiedades} type="checkbox" checked={Boolean(valor)} onChange={(evento) => alCambiar(evento.target.checked)} {...resto} />
        <span className="campo-casilla-texto">
          <label htmlFor={id}>{etiqueta}</label>
          {ayuda && !error && <small className="campo-ayuda">{ayuda}</small>}
          {mensajeError}
        </span>
      </div>
    );
  }

  let control;
  if (opciones) {
    control = (
      <select {...propiedades} value={valor} onChange={(evento) => alCambiar(evento.target.value)} {...resto}>
        <option value="">{textoVacio ?? 'Selecciona…'}</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    );
  } else if (tipo === 'textarea') {
    control = <textarea {...propiedades} rows={3} value={valor} onChange={(evento) => alCambiar(evento.target.value)} {...resto} />;
  } else {
    control = <input {...propiedades} type={tipo} value={valor} onChange={(evento) => alCambiar(evento.target.value)} {...resto} />;
  }

  return (
    <div className={`campo${claseAncho}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {accion ? (
        <span className="campo-control">
          {control}
          {accion}
        </span>
      ) : (
        control
      )}
      {ayuda && !error && <small className="campo-ayuda">{ayuda}</small>}
      {mensajeError}
    </div>
  );
}
