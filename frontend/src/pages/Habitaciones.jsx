import { Link } from 'react-router-dom';
import AlertaError from '../components/AlertaError.jsx';
import Boton from '../components/Boton.jsx';
import Campo from '../components/Campo.jsx';
import ChipsFiltro from '../components/ChipsFiltro.jsx';
import ConfirmarAccion from '../components/ConfirmarAccion.jsx';
import EstadoListado from '../components/EstadoListado.jsx';
import FormularioHabitacion from '../components/FormularioHabitacion.jsx';
import { IconoMas } from '../components/Iconos.jsx';
import MarcoFoto from '../components/MarcoFoto.jsx';
import Modal from '../components/Modal.jsx';
import Pagina from '../components/Pagina.jsx';
import Paginacion from '../components/Paginacion.jsx';
import TarjetaHabitacion from '../components/TarjetaHabitacion.jsx';
import { habitaciones } from '../api/recursos.js';
import { useGestion } from '../hooks/useGestion.js';
import { useListado } from '../hooks/useListado.js';
import { useOpcionesDeHoteles } from '../hooks/useOpciones.js';
import { useResumenDeHabitaciones } from '../hooks/useResumen.js';
import { OPCIONES_ACTIVO, OPCIONES_ESTADO_HABITACION, OPCIONES_TIPO_HABITACION } from '../utils/catalogos.js';
import { urlDeFoto } from '../utils/imagenes.js';

const FILTROS_INICIALES = { q: '', hotelId: '', tipo: '', estado: '', activo: '' };
const MENSAJES = {
  guardado: 'Habitación guardada',
  eliminado: 'Habitación eliminada',
  activado: 'Habitación activada',
  desactivado: 'Habitación desactivada',
};

// La API ordena por hotel y número, así que las habitaciones de un mismo hotel llegan seguidas.
function agruparPorHotel(filas) {
  const grupos = [];
  for (const fila of filas) {
    const ultimo = grupos.at(-1);
    if (ultimo?.hotelId === fila.hotelId) ultimo.filas.push(fila);
    else grupos.push({ hotelId: fila.hotelId, hotel: fila.hotel, filas: [fila] });
  }
  return grupos;
}

export default function Habitaciones() {
  const listado = useListado(habitaciones.listar, FILTROS_INICIALES);
  const { resumen, recargar: recargarResumen } = useResumenDeHabitaciones();
  const gestion = useGestion({
    api: habitaciones,
    mensajes: MENSAJES,
    recargar: () => {
      listado.recargar();
      recargarResumen();
    },
  });
  const opcionesDeHoteles = useOpcionesDeHoteles();

  const cifras = [
    { valor: resumen?.total, etiqueta: 'Habitaciones' },
    { valor: OPCIONES_TIPO_HABITACION.length, etiqueta: 'Tipos' },
  ];

  return (
    <Pagina
      etiqueta="Inventario"
      titulo="Habitaciones"
      descripcion="Inventario de habitaciones de cada hotel, con su precio y estado."
      cifras={cifras}
      acciones={
        <Boton variante="dorado" onClick={gestion.abrirNuevo}>
          <IconoMas />
          Nueva habitación
        </Boton>
      }
    >
      <div className="filtros filtros-con-chips">
        <ChipsFiltro etiqueta="Filtrar por hotel" opciones={opcionesDeHoteles} {...listado.filtro('hotelId')} />
        <div className="filtros-campos">
          <Campo etiqueta="Buscar por número" tipo="search" placeholder="Ej. 201" {...listado.filtro('q')} />
          <Campo etiqueta="Tipo" opciones={OPCIONES_TIPO_HABITACION} textoVacio="Todos" {...listado.filtro('tipo')} />
          <Campo etiqueta="Estado" opciones={OPCIONES_ESTADO_HABITACION} textoVacio="Todos" {...listado.filtro('estado')} />
          <Campo etiqueta="Activa" opciones={OPCIONES_ACTIVO} textoVacio="Todas" {...listado.filtro('activo')} />
        </div>
      </div>

      <AlertaError error={gestion.errorAccion} />
      <EstadoListado cargando={listado.cargando} error={listado.error} vacio={listado.filas.length === 0} />
      <div className={`grupos-hotel${listado.cargando ? ' listado-cargando' : ''}`}>
        {agruparPorHotel(listado.filas).map(({ hotelId, hotel, filas }) => (
          <section key={hotelId} className="grupo-hotel">
            <header className="grupo-hotel-encabezado">
              <div className="grupo-hotel-titulo">
                <MarcoFoto
                  compacto
                  relacion="13 / 9"
                  className="miniatura-hotel"
                  etiqueta="Foto hotel"
                  imagen={hotel?.imagenes?.[0] && urlDeFoto(hotel.imagenes[0].url, 'encabezadoHotel')}
                  alt={hotel?.nombre}
                />
                <div>
                  <span className="etiqueta-ciudad">{hotel?.direccion?.ciudad}</span>
                  <h2>{hotel?.nombre}</h2>
                </div>
              </div>
              <Link to="/hoteles" className="enlace-fuerte">
                Ver hotel →
              </Link>
            </header>
            <div className="rejilla-habitaciones">
              {filas.map((habitacion) => (
                <TarjetaHabitacion
                  key={habitacion._id}
                  habitacion={habitacion}
                  alEditar={() => gestion.abrirEdicion(habitacion)}
                  alAlternarActivo={() => gestion.alternarActivo(habitacion)}
                  alEliminar={() => gestion.pedirEliminar(habitacion)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
      <Paginacion pagina={listado.pagina} total={listado.total} alCambiar={listado.cambiarPagina} />

      {gestion.edicion && (
        <Modal
          etiqueta="Habitaciones"
          titulo={gestion.edicion === 'nuevo' ? 'Nueva habitación' : 'Editar habitación'}
          descripcion="Define tipo, capacidad, precio y fotos."
          alCerrar={gestion.cerrarEdicion}
        >
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
          mensaje={`¿Eliminar la habitación ${gestion.aEliminar.numero} de «${gestion.aEliminar.hotel?.nombre}» y sus fotos? Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          peligro
          alConfirmar={gestion.eliminar}
          alCancelar={gestion.cancelarEliminar}
          alternativa={{ texto: 'Desactivar en su lugar', ejecutar: gestion.desactivarEnLugarDeEliminar }}
        />
      )}
    </Pagina>
  );
}
