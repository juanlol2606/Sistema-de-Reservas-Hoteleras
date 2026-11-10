import AlertaError from '../components/AlertaError.jsx';
import Boton from '../components/Boton.jsx';
import Campo from '../components/Campo.jsx';
import ConfirmarAccion from '../components/ConfirmarAccion.jsx';
import EstadoListado from '../components/EstadoListado.jsx';
import FormularioHotel from '../components/FormularioHotel.jsx';
import { IconoMas } from '../components/Iconos.jsx';
import Modal from '../components/Modal.jsx';
import Pagina from '../components/Pagina.jsx';
import Paginacion from '../components/Paginacion.jsx';
import TarjetaHotel from '../components/TarjetaHotel.jsx';
import { hoteles } from '../api/recursos.js';
import { useGestion } from '../hooks/useGestion.js';
import { useListado } from '../hooks/useListado.js';
import { useResumenDeHoteles } from '../hooks/useResumen.js';
import { OPCIONES_ACTIVO, OPCIONES_ESTRELLAS } from '../utils/catalogos.js';

const FILTROS_INICIALES = { q: '', ciudad: '', estrellas: '', activo: '' };
const MENSAJES = { guardado: 'Hotel guardado', eliminado: 'Hotel eliminado', activado: 'Hotel activado', desactivado: 'Hotel desactivado' };

export default function Hoteles() {
  const listado = useListado(hoteles.listar, FILTROS_INICIALES);
  const { resumen, recargar: recargarResumen } = useResumenDeHoteles();
  const gestion = useGestion({
    api: hoteles,
    mensajes: MENSAJES,
    recargar: () => {
      listado.recargar();
      recargarResumen();
    },
  });

  const cifras = [
    { valor: resumen?.total, etiqueta: 'Hoteles' },
    { valor: resumen?.activos, etiqueta: 'Activos' },
    { valor: resumen?.habitaciones, etiqueta: 'Habitaciones' },
    { valor: resumen?.promedio?.toFixed(2), etiqueta: 'Calif. promedio', resaltada: true },
  ];

  return (
    <Pagina
      etiqueta="Red de hoteles"
      titulo="Nuestros hoteles"
      descripcion="Los hoteles de la red y su calificación promedio."
      cifras={cifras}
      acciones={
        <Boton variante="dorado" onClick={gestion.abrirNuevo}>
          <IconoMas />
          Nuevo hotel
        </Boton>
      }
    >
      <div className="filtros">
        <Campo etiqueta="Buscar por nombre" tipo="search" placeholder="Ej. Casa Bahía" {...listado.filtro('q')} />
        <Campo etiqueta="Ciudad" placeholder="Ej. Medellín" {...listado.filtro('ciudad')} />
        <Campo etiqueta="Estrellas" opciones={OPCIONES_ESTRELLAS} textoVacio="Todas" {...listado.filtro('estrellas')} />
        <Campo etiqueta="Estado" opciones={OPCIONES_ACTIVO} textoVacio="Todos" {...listado.filtro('activo')} />
      </div>

      <div className="titulo-listado">
        <h2>Todos los hoteles</h2>
        <span>
          {listado.total} {listado.total === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      <AlertaError error={gestion.errorAccion} />
      <EstadoListado cargando={listado.cargando} error={listado.error} vacio={listado.filas.length === 0} />
      <div className={`rejilla-hoteles${listado.cargando ? ' listado-cargando' : ''}`}>
        {listado.filas.map((hotel) => (
          <TarjetaHotel
            key={hotel._id}
            hotel={hotel}
            alEditar={() => gestion.abrirEdicion(hotel)}
            alAlternarActivo={() => gestion.alternarActivo(hotel)}
            alEliminar={() => gestion.pedirEliminar(hotel)}
          />
        ))}
        {!listado.error && (
          <button type="button" className="tarjeta-agregar" onClick={gestion.abrirNuevo}>
            <span className="tarjeta-agregar-icono">
              <IconoMas />
            </span>
            <span className="tarjeta-agregar-titulo">Agregar hotel</span>
            <span>Datos y fotos</span>
          </button>
        )}
      </div>
      <Paginacion pagina={listado.pagina} total={listado.total} alCambiar={listado.cambiarPagina} mostrarTotal={false} />

      {gestion.edicion && (
        <Modal
          etiqueta="Hoteles"
          titulo={gestion.edicion === 'nuevo' ? 'Nuevo hotel' : 'Editar hotel'}
          descripcion="Completa los datos y agrega fotos para mostrarlo en la red."
          alCerrar={gestion.cerrarEdicion}
        >
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
          mensaje={`¿Eliminar «${gestion.aEliminar.nombre}» junto con todas sus habitaciones y sus fotos? Esta acción no se puede deshacer.`}
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
