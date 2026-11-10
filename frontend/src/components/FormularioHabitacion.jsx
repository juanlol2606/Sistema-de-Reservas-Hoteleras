import { habitaciones } from '../api/recursos.js';
import { useFormulario } from '../hooks/useFormulario.js';
import { useFotos } from '../hooks/useFotos.js';
import { useOpcionesDeHoteles } from '../hooks/useOpciones.js';
import { OPCIONES_ESTADO_HABITACION, OPCIONES_TIPO_HABITACION } from '../utils/catalogos.js';
import { separarPorComas } from '../utils/formato.js';
import { conErrores, entero, numeroPositivo, requerido, textoObligatorio } from '../utils/validaciones.js';
import Campo from './Campo.jsx';
import Formulario from './Formulario.jsx';
import Seccion from './Seccion.jsx';
import SubirFotos from './SubirFotos.jsx';

const VALORES_NUEVOS = {
  hotelId: '',
  numero: '',
  tipo: 'doble',
  capacidad: '2',
  precioNoche: '',
  estado: 'disponible',
  activo: true,
  amenidades: '',
};

const desdeHabitacion = (h) => ({
  hotelId: h.hotelId,
  numero: h.numero,
  tipo: h.tipo,
  capacidad: String(h.capacidad),
  precioNoche: String(h.precioNoche),
  estado: h.estado,
  activo: h.activo,
  amenidades: h.amenidades.join(', '),
});

export default function FormularioHabitacion({ habitacion, alGuardar, alCancelar }) {
  const opcionesDeHoteles = useOpcionesDeHoteles();
  const fotos = useFotos(habitacion?.imagenes ?? [], habitaciones.imagenes);

  const formulario = useFormulario({
    valores: habitacion ? desdeHabitacion(habitacion) : VALORES_NUEVOS,
    validar: (v) =>
      conErrores({
        hotelId: requerido(v.hotelId),
        numero: textoObligatorio(v.numero, 10),
        tipo: requerido(v.tipo),
        capacidad: entero(v.capacidad, 1, 12),
        precioNoche: numeroPositivo(v.precioNoche),
      }),
    alEnviar: (v) => {
      const datos = {
        numero: v.numero.trim(),
        tipo: v.tipo,
        capacidad: Number(v.capacidad),
        precioNoche: Number(v.precioNoche),
        estado: v.estado,
        activo: v.activo,
        amenidades: separarPorComas(v.amenidades),
      };
      return alGuardar(habitacion ? datos : { ...datos, hotelId: v.hotelId }, (guardada) => fotos.sincronizar(guardada._id));
    },
  });

  return (
    <Formulario formulario={formulario} alCancelar={alCancelar}>
      <Seccion titulo="Fotos de la habitación">
        <SubirFotos fotos={fotos} etiquetaPortada="Cama y vista principal" icono="cama" />
      </Seccion>
      <Campo
        etiqueta="Hotel"
        ancho="completo"
        opciones={opcionesDeHoteles}
        disabled={Boolean(habitacion)}
        ayuda={habitacion ? 'El hotel de una habitación no se puede cambiar.' : undefined}
        {...formulario.campo('hotelId')}
      />
      <Campo etiqueta="Número" placeholder="Ej. 201" {...formulario.campo('numero')} />
      <Campo etiqueta="Tipo" opciones={OPCIONES_TIPO_HABITACION} {...formulario.campo('tipo')} />
      <Campo etiqueta="Capacidad (huéspedes)" tipo="number" min="1" {...formulario.campo('capacidad')} />
      <Campo etiqueta="Precio por noche (COP)" tipo="number" min="0" step="1000" placeholder="Ej. 250000" {...formulario.campo('precioNoche')} />
      <Campo etiqueta="Estado" opciones={OPCIONES_ESTADO_HABITACION} {...formulario.campo('estado')} />
      <Campo etiqueta="Habitación activa" tipo="checkbox" {...formulario.campo('activo')} />
      <Campo etiqueta="Amenidades" ancho="completo" placeholder="wifi, minibar, jacuzzi" ayuda="Separadas por comas." {...formulario.campo('amenidades')} />
    </Formulario>
  );
}
