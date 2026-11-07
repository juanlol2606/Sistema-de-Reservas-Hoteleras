import AccionesFila from '../components/AccionesFila.jsx';
import AlertaError from '../components/AlertaError.jsx';
import Campo from '../components/Campo.jsx';
import ConfirmarAccion from '../components/ConfirmarAccion.jsx';
import EncabezadoPagina from '../components/EncabezadoPagina.jsx';
import { Estrellas } from '../components/Estrellas.jsx';
import FormularioHotel from '../components/FormularioHotel.jsx';
import { InsigniaActivo } from '../components/Insignia.jsx';
import Modal from '../components/Modal.jsx';
import Paginacion from '../components/Paginacion.jsx';
import Tabla from '../components/Tabla.jsx';
import { hoteles } from '../api/recursos.js';
import { useGestion } from '../hooks/useGestion.js';
import { useListado } from '../hooks/useListado.js';
import { OPCIONES_ACTIVO, OPCIONES_ESTRELLAS } from '../utils/catalogos.js';

const FILTROS_INICIALES = { q: '', ciudad: '', estrellas: '', activo: '' };
const MENSAJES = { guardado: 'Hotel guardado', eliminado: 'Hotel eliminado', activado: 'Hotel activado', desactivado: 'Hotel desactivado' };

export default function Hoteles() {
  const listado = useListado(hoteles.listar, FILTROS_INICIALES);
  const gestion = useGestion({ api: hoteles, mensajes: MENSAJES, recargar: listado.recargar });

  const columnas = [
    {
      titulo: 'Hotel',
      render: (hotel) => (
        <>
          <strong>{hotel.nombre}</strong>
          <span className="secundario">{hotel.direccion.calle}</span>
        </>
      ),
    },
    { titulo: 'Ciudad', render: (hotel) => hotel.direccion.ciudad },
    { titulo: 'Categoría', render: (hotel) => <Estrellas cantidad={hotel.estrellas} /> },
    {
      titulo: 'Calificación',
      render: (hotel) => (hotel.calificacionPromedio ? `${hotel.calificacionPromedio.toFixed(2)} / 5` : 'Sin reseñas'),
    },
    { titulo: 'Estado', render: (hotel) => <InsigniaActivo activo={hotel.activo} /> },
    {
      titulo: 'Acciones',
      clase: 'acciones-fila',
      render: (hotel) => (
        <AccionesFila
          activo={hotel.activo}
          alEditar={() => gestion.abrirEdicion(hotel)}
          alAlternarActivo={() => gestion.alternarActivo(hotel)}
          alEliminar={() => gestion.pedirEliminar(hotel)}
        />
      ),
    },
  ];

  return (
    <>
      <EncabezadoPagina titulo="Hoteles" descripcion="Los hoteles de la red y su calificación promedio.">
        <button type="button" className="boton boton-primario" onClick={gestion.abrirNuevo}>
          Nuevo hotel
        </button>
      </EncabezadoPagina>

      <div className="filtros">
        <Campo etiqueta="Buscar por nombre" tipo="search" placeholder="Ej. Casa Bahía" {...listado.filtro('q')} />
        <Campo etiqueta="Ciudad" placeholder="Ej. Medellín" {...listado.filtro('ciudad')} />
        <Campo etiqueta="Estrellas" opciones={OPCIONES_ESTRELLAS} textoVacio="Todas" {...listado.filtro('estrellas')} />
        <Campo etiqueta="Estado" opciones={OPCIONES_ACTIVO} textoVacio="Todos" {...listado.filtro('activo')} />
      </div>

      <AlertaError error={gestion.errorAccion} />
      <Tabla columnas={columnas} filas={listado.filas} cargando={listado.cargando} error={listado.error} />
      <Paginacion pagina={listado.pagina} total={listado.total} alCambiar={listado.cambiarPagina} />

      {gestion.edicion && (
        <Modal titulo={gestion.edicion === 'nuevo' ? 'Nuevo hotel' : 'Editar hotel'} alCerrar={gestion.cerrarEdicion}>
          <FormularioHotel
            hotel={gestion.edicion === 'nuevo' ? null : gestion.edicion}
            alGuardar={gestion.guardar}
            alCancelar={gestion.cerrarEdicion}
          />
        </Modal>
      )}

      {gestion.aEliminar && (
        <ConfirmarAccion
          titulo="Eliminar hotel"
          mensaje={`¿Eliminar «${gestion.aEliminar.nombre}» junto con todas sus habitaciones? Esta acción no se puede deshacer.`}
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
