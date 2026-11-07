import { useFormulario } from '../hooks/useFormulario.js';
import { conErrores, maximo } from '../utils/validaciones.js';
import Campo from './Campo.jsx';
import { SelectorEstrellas } from './Estrellas.jsx';
import Formulario from './Formulario.jsx';

export default function FormularioResena({ alPublicar }) {
  const formulario = useFormulario({
    valores: { puntuacion: 0, comentario: '' },
    validar: (v) => conErrores({ puntuacion: v.puntuacion ? undefined : 'Elige una puntuación', comentario: maximo(v.comentario, 500) }),
    alEnviar: (v) => alPublicar({ puntuacion: v.puntuacion, comentario: v.comentario.trim() || undefined }),
  });

  return (
    <Formulario formulario={formulario} textoEnviar="Publicar reseña">
      <div className="campo campo-completo">
        <label>Puntuación</label>
        <SelectorEstrellas valor={formulario.valores.puntuacion} alCambiar={(n) => formulario.cambiar('puntuacion', n)} />
        {formulario.errores.puntuacion && <small className="campo-error">{formulario.errores.puntuacion}</small>}
      </div>
      <Campo etiqueta="Comentario (opcional)" tipo="textarea" ancho="completo" maxLength={500} {...formulario.campo('comentario')} />
    </Formulario>
  );
}
