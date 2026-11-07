import { useId } from 'react';

// Campo de formulario o de filtro: etiqueta + control + mensaje de error. `opciones` lo convierte en un select.
export default function Campo({ etiqueta, nombre, valor, error, alCambiar, tipo = 'text', opciones, textoVacio, ayuda, ancho, ...resto }) {
  const id = `campo-${nombre}-${useId()}`;
  const propiedades = { id, name: nombre, 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-error` : undefined };

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
  } else if (tipo === 'checkbox') {
    control = <input {...propiedades} type="checkbox" checked={Boolean(valor)} onChange={(evento) => alCambiar(evento.target.checked)} {...resto} />;
  } else if (tipo === 'textarea') {
    control = <textarea {...propiedades} rows={3} value={valor} onChange={(evento) => alCambiar(evento.target.value)} {...resto} />;
  } else {
    control = <input {...propiedades} type={tipo} value={valor} onChange={(evento) => alCambiar(evento.target.value)} {...resto} />;
  }

  return (
    <div className={`campo ${tipo === 'checkbox' ? 'campo-casilla' : ''} ${ancho === 'completo' ? 'campo-completo' : ''}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {control}
      {ayuda && !error && <small className="campo-ayuda">{ayuda}</small>}
      {error && (
        <small id={`${id}-error`} className="campo-error">
          {error}
        </small>
      )}
    </div>
  );
}
