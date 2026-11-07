import { useFormulario } from '../hooks/useFormulario.js';
import { OPCIONES_TIPO_DOCUMENTO } from '../utils/catalogos.js';
import { recortarTextos } from '../utils/formato.js';
import { conErrores, email, requerido, telefono, textoObligatorio } from '../utils/validaciones.js';
import Campo from './Campo.jsx';
import Formulario from './Formulario.jsx';

const VALORES_NUEVOS = {
  nombre: '',
  email: '',
  documento: { tipo: 'CC', numero: '' },
  telefono: '',
  ciudadOrigen: '',
  activo: true,
};

const REGEX_DOCUMENTO = /^[A-Za-z0-9]{4,20}$/;

const desdeHuesped = (h) => ({
  nombre: h.nombre,
  email: h.email,
  documento: { ...h.documento },
  telefono: h.telefono,
  ciudadOrigen: h.ciudadOrigen,
  activo: h.activo,
});

export default function FormularioHuesped({ huesped, alGuardar, alCancelar }) {
  const formulario = useFormulario({
    valores: huesped ? desdeHuesped(huesped) : VALORES_NUEVOS,
    validar: (v) =>
      conErrores({
        nombre: textoObligatorio(v.nombre),
        email: email(v.email),
        'documento.tipo': requerido(v.documento.tipo),
        'documento.numero':
          requerido(v.documento.numero) ?? (REGEX_DOCUMENTO.test(v.documento.numero.trim()) ? undefined : 'Debe tener entre 4 y 20 letras o números'),
        telefono: telefono(v.telefono),
        ciudadOrigen: textoObligatorio(v.ciudadOrigen, 80),
      }),
    alEnviar: (v) =>
      alGuardar({
        nombre: v.nombre.trim(),
        email: v.email.trim(),
        documento: recortarTextos(v.documento),
        telefono: v.telefono.trim(),
        ciudadOrigen: v.ciudadOrigen.trim(),
        activo: v.activo,
      }),
  });

  return (
    <Formulario formulario={formulario} alCancelar={alCancelar}>
      <Campo etiqueta="Nombre completo" ancho="completo" {...formulario.campo('nombre')} />
      <Campo etiqueta="Correo electrónico" tipo="email" {...formulario.campo('email')} />
      <Campo etiqueta="Teléfono" tipo="tel" {...formulario.campo('telefono')} />
      <Campo etiqueta="Tipo de documento" opciones={OPCIONES_TIPO_DOCUMENTO} {...formulario.campo('documento.tipo')} />
      <Campo etiqueta="Número de documento" {...formulario.campo('documento.numero')} />
      <Campo etiqueta="Ciudad de origen" {...formulario.campo('ciudadOrigen')} />
      <Campo etiqueta="Huésped activo" tipo="checkbox" {...formulario.campo('activo')} />
    </Formulario>
  );
}
