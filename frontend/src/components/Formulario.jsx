import AlertaError from './AlertaError.jsx';

export default function Formulario({ formulario, textoEnviar = 'Guardar', alCancelar, children }) {
  return (
    <form className="formulario" onSubmit={formulario.enviar} noValidate>
      <AlertaError error={formulario.errorGeneral} />
      <div className="rejilla-formulario">{children}</div>
      <div className="acciones">
        {alCancelar && (
          <button type="button" className="boton" onClick={alCancelar} disabled={formulario.enviando}>
            Cancelar
          </button>
        )}
        <button type="submit" className="boton boton-primario" disabled={formulario.enviando}>
          {formulario.enviando ? 'Guardando…' : textoEnviar}
        </button>
      </div>
    </form>
  );
}
