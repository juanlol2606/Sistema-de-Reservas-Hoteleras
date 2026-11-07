import { useFormulario } from '../hooks/useFormulario.js';
import { OPCIONES_ESTRELLAS } from '../utils/catalogos.js';
import { recortarTextos, separarPorComas } from '../utils/formato.js';
import { conErrores, email, entero, telefono, textoObligatorio } from '../utils/validaciones.js';
import Campo from './Campo.jsx';
import Formulario from './Formulario.jsx';

const VALORES_NUEVOS = {
  nombre: '',
  estrellas: '3',
  activo: true,
  direccion: { calle: '', ciudad: '', pais: 'Colombia' },
  contacto: { telefono: '', email: '' },
  servicios: '',
};

const desdeHotel = (hotel) => ({
  nombre: hotel.nombre,
  estrellas: String(hotel.estrellas),
  activo: hotel.activo,
  direccion: { ...hotel.direccion },
  contacto: { ...hotel.contacto },
  servicios: hotel.servicios.join(', '),
});

export default function FormularioHotel({ hotel, alGuardar, alCancelar }) {
  const formulario = useFormulario({
    valores: hotel ? desdeHotel(hotel) : VALORES_NUEVOS,
    validar: (v) =>
      conErrores({
        nombre: textoObligatorio(v.nombre),
        estrellas: entero(v.estrellas, 1, 5),
        'direccion.calle': textoObligatorio(v.direccion.calle, 150),
        'direccion.ciudad': textoObligatorio(v.direccion.ciudad, 80),
        'direccion.pais': textoObligatorio(v.direccion.pais, 80),
        'contacto.telefono': telefono(v.contacto.telefono),
        'contacto.email': email(v.contacto.email),
      }),
    alEnviar: (v) =>
      alGuardar({
        nombre: v.nombre.trim(),
        estrellas: Number(v.estrellas),
        activo: v.activo,
        direccion: recortarTextos(v.direccion),
        contacto: recortarTextos(v.contacto),
        servicios: separarPorComas(v.servicios),
      }),
  });

  return (
    <Formulario formulario={formulario} alCancelar={alCancelar}>
      <Campo etiqueta="Nombre" {...formulario.campo('nombre')} />
      <Campo etiqueta="Estrellas" opciones={OPCIONES_ESTRELLAS} {...formulario.campo('estrellas')} />
      <Campo etiqueta="Calle y número" ancho="completo" {...formulario.campo('direccion.calle')} />
      <Campo etiqueta="Ciudad" {...formulario.campo('direccion.ciudad')} />
      <Campo etiqueta="País" {...formulario.campo('direccion.pais')} />
      <Campo etiqueta="Teléfono" tipo="tel" {...formulario.campo('contacto.telefono')} />
      <Campo etiqueta="Correo de contacto" tipo="email" {...formulario.campo('contacto.email')} />
      <Campo etiqueta="Servicios" ancho="completo" ayuda="Separados por comas: wifi, piscina, desayuno" {...formulario.campo('servicios')} />
      <Campo etiqueta="Hotel activo (recibe reservas)" tipo="checkbox" {...formulario.campo('activo')} />
    </Formulario>
  );
}
