import AlertaError from './AlertaError.jsx';
import Boton from './Boton.jsx';

export default function Formulario({ formulario, textoEnviar = 'Guardar', alCancelar, variante = 'dorado', children }) {
  return (
    <form className="formulario" onSubmit={formulario.enviar} noValidate>
      <AlertaError error={formulario.errorGeneral} />
      <div className="rejilla-formulario">{children}</div>
      <div className="acciones">
        {alCancelar && (
          <Boton onClick={alCancelar} disabled={formulario.enviando}>
            Cancelar
          </Boton>
        )}
        <Boton type="submit" variante={variante} disabled={formulario.enviando}>
          {formulario.enviando ? 'Guardando…' : textoEnviar}
        </Boton>
      </div>
    </form>
  );
}
