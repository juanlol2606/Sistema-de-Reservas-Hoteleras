import { hoteles } from '../api/recursos.js';
import { useFormulario } from '../hooks/useFormulario.js';
import { useFotos } from '../hooks/useFotos.js';
import { OPCIONES_ESTRELLAS } from '../utils/catalogos.js';
import { recortarTextos, separarPorComas } from '../utils/formato.js';
import { conErrores, email, entero, telefono, textoObligatorio } from '../utils/validaciones.js';
import Campo from './Campo.jsx';
import Formulario from './Formulario.jsx';
import Seccion from './Seccion.jsx';
import SubirFotos from './SubirFotos.jsx';

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
  const fotos = useFotos(hotel?.imagenes ?? [], hoteles.imagenes);
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
      alGuardar(
        {
          nombre: v.nombre.trim(),
          estrellas: Number(v.estrellas),
          activo: v.activo,
          direccion: recortarTextos(v.direccion),
          contacto: recortarTextos(v.contacto),
          servicios: separarPorComas(v.servicios),
        },
        (guardado) => fotos.sincronizar(guardado._id),
      ),
  });

  return (
    <Formulario formulario={formulario} alCancelar={alCancelar}>
      <Seccion titulo="Fotos del hotel">
        <SubirFotos fotos={fotos} etiquetaPortada="Fachada o lobby" />
      </Seccion>
      <Seccion titulo="Información">
        <Campo etiqueta="Nombre" placeholder="Ej. Casa Bahía" {...formulario.campo('nombre')} />
        <Campo etiqueta="Estrellas" opciones={OPCIONES_ESTRELLAS} {...formulario.campo('estrellas')} />
        <Campo etiqueta="Calle y número" ancho="completo" placeholder="Ej. Calle del Arsenal # 8-27" {...formulario.campo('direccion.calle')} />
        <Campo etiqueta="Ciudad" placeholder="Ej. Cartagena" {...formulario.campo('direccion.ciudad')} />
        <Campo etiqueta="País" {...formulario.campo('direccion.pais')} />
      </Seccion>
      <Seccion titulo="Contacto">
        <Campo etiqueta="Teléfono" tipo="tel" {...formulario.campo('contacto.telefono')} />
        <Campo etiqueta="Correo de contacto" tipo="email" {...formulario.campo('contacto.email')} />
      </Seccion>
      <Campo etiqueta="Servicios" ancho="completo" placeholder="wifi, piscina, desayuno" ayuda="Separados por comas." {...formulario.campo('servicios')} />
      <Campo etiqueta="Hotel activo" tipo="checkbox" ancho="completo" ayuda="Recibe reservas" {...formulario.campo('activo')} />
    </Formulario>
  );
}
