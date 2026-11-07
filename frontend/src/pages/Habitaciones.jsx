import AccionesFila from '../components/AccionesFila.jsx';
import AlertaError from '../components/AlertaError.jsx';
import Campo from '../components/Campo.jsx';
import ConfirmarAccion from '../components/ConfirmarAccion.jsx';
import EncabezadoPagina from '../components/EncabezadoPagina.jsx';
import FormularioHabitacion from '../components/FormularioHabitacion.jsx';
import Insignia from '../components/Insignia.jsx';
import Modal from '../components/Modal.jsx';
import Paginacion from '../components/Paginacion.jsx';
import Tabla from '../components/Tabla.jsx';
import { habitaciones } from '../api/recursos.js';
import { useGestion } from '../hooks/useGestion.js';
import { useListado } from '../hooks/useListado.js';
import { useOpcionesDeHoteles } from '../hooks/useOpciones.js';
import {
  ETIQUETAS_ESTADO_HABITACION,
  ETIQUETAS_TIPO_HABITACION,
  OPCIONES_ACTIVO,
  OPCIONES_ESTADO_HABITACION,
  OPCIONES_TIPO_HABITACION,
} from '../utils/catalogos.js';
import { formatearPesos } from '../utils/formato.js';

const FILTROS_INICIALES = { q: '', hotelId: '', tipo: '', estado: '', activo: '' };
const MENSAJES = {
  guardado: 'Habitación guardada',
  eliminado: 'Habitación eliminada',
  activado: 'Habitación activada',
  desactivado: 'Habitación desactivada',
};

export default function Habitaciones() {
  const listado = useListado(habitaciones.listar, FILTROS_INICIALES);
  const gestion = useGestion({ api: habitaciones, mensajes: MENSAJES, recargar: listado.recargar });
  const opcionesDeHoteles = useOpcionesDeHoteles();

  const columnas = [
    {
      titulo: 'Hotel',
      render: (habitacion) => (
        <>
          <strong>{habitacion.hotel?.nombre}</strong>
          <span className="secundario">{habitacion.hotel?.direccion?.ciudad}</span>
        </>
      ),
    },
    {
      titulo: 'Habitación',
      render: (habitacion) => (
        <>
          <strong>{habitacion.numero}</strong> · {ETIQUETAS_TIPO_HABITACION[habitacion.tipo]}
          <span className="secundario">
            Hasta {habitacion.capacidad} {habitacion.capacidad === 1 ? 'persona' : 'personas'}
          </span>
        </>
      ),
    },
    { titulo: 'Precio por noche', clase: 'derecha', render: (habitacion) => formatearPesos(habitacion.precioNoche) },
    {
      titulo: 'Estado',
      render: (habitacion) => (
        <div className="grupo-insignias">
          <Insignia tono={habitacion.estado === 'disponible' ? 'exito' : 'aviso'}>{ETIQUETAS_ESTADO_HABITACION[habitacion.estado]}</Insignia>
          {!habitacion.activo && <Insignia>Inactiva</Insignia>}
        </div>
      ),
    },
    {
      titulo: 'Acciones',
      clase: 'acciones-fila',
      render: (habitacion) => (
        <AccionesFila
          activo={habitacion.activo}
          alEditar={() => gestion.abrirEdicion(habitacion)}
          alAlternarActivo={() => gestion.alternarActivo(habitacion)}
          alEliminar={() => gestion.pedirEliminar(habitacion)}
        />
      ),
    },
  ];

  return (
    <>
      <EncabezadoPagina titulo="Habitaciones" descripcion="Inventario de habitaciones de cada hotel, con su precio y estado.">
        <button type="button" className="boton boton-primario" onClick={gestion.abrirNuevo}>
          Nueva habitación
        </button>
      </EncabezadoPagina>

      <div className="filtros">
        <Campo etiqueta="Buscar por número" tipo="search" placeholder="Ej. 201" {...listado.filtro('q')} />
        <Campo etiqueta="Hotel" opciones={opcionesDeHoteles} textoVacio="Todos" {...listado.filtro('hotelId')} />
        <Campo etiqueta="Tipo" opciones={OPCIONES_TIPO_HABITACION} textoVacio="Todos" {...listado.filtro('tipo')} />
        <Campo etiqueta="Estado" opciones={OPCIONES_ESTADO_HABITACION} textoVacio="Todos" {...listado.filtro('estado')} />
        <Campo etiqueta="Activa" opciones={OPCIONES_ACTIVO} textoVacio="Todas" {...listado.filtro('activo')} />
      </div>

      <AlertaError error={gestion.errorAccion} />
      <Tabla columnas={columnas} filas={listado.filas} cargando={listado.cargando} error={listado.error} />
      <Paginacion pagina={listado.pagina} total={listado.total} alCambiar={listado.cambiarPagina} />

      {gestion.edicion && (
        <Modal titulo={gestion.edicion === 'nuevo' ? 'Nueva habitación' : 'Editar habitación'} alCerrar={gestion.cerrarEdicion}>
          <FormularioHabitacion
            habitacion={gestion.edicion === 'nuevo' ? null : gestion.edicion}
            alGuardar={gestion.guardar}
            alCancelar={gestion.cerrarEdicion}
          />
        </Modal>
      )}

      {gestion.aEliminar && (
        <ConfirmarAccion
          titulo="Eliminar habitación"
          mensaje={`¿Eliminar la habitación ${gestion.aEliminar.numero} de «${gestion.aEliminar.hotel?.nombre}»? Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          peligro
          alConfirmar={gestion.eliminar}
          alCancelar={gestion.cancelarEliminar}
          alternativa={{ texto: 'Desactivar en su lugar', ejecutar: gestion.desactivarEnLugarDeEliminar }}
        />
      )}
    </>
  );
}
