import AccionesFila from '../components/AccionesFila.jsx';
import AlertaError from '../components/AlertaError.jsx';
import Avatar from '../components/Avatar.jsx';
import Boton from '../components/Boton.jsx';
import Campo from '../components/Campo.jsx';
import ConfirmarAccion from '../components/ConfirmarAccion.jsx';
import FormularioHuesped from '../components/FormularioHuesped.jsx';
import { IconoMas } from '../components/Iconos.jsx';
import { InsigniaActivo } from '../components/Insignia.jsx';
import Modal from '../components/Modal.jsx';
import Pagina from '../components/Pagina.jsx';
import Paginacion from '../components/Paginacion.jsx';
import Tabla from '../components/Tabla.jsx';
import { huespedes } from '../api/recursos.js';
import { useGestion } from '../hooks/useGestion.js';
import { useListado } from '../hooks/useListado.js';
import { useResumenDeHuespedes } from '../hooks/useResumen.js';
import { OPCIONES_ACTIVO } from '../utils/catalogos.js';

const FILTROS_INICIALES = { q: '', ciudad: '', activo: '' };
const MENSAJES = { guardado: 'Huésped guardado', eliminado: 'Huésped eliminado', activado: 'Huésped activado', desactivado: 'Huésped desactivado' };

export default function Huespedes() {
  const listado = useListado(huespedes.listar, FILTROS_INICIALES);
  const { resumen, recargar: recargarResumen } = useResumenDeHuespedes();
  const gestion = useGestion({
    api: huespedes,
    mensajes: MENSAJES,
    recargar: () => {
      listado.recargar();
      recargarResumen();
    },
  });

  const columnas = [
    {
      titulo: 'Huésped',
      render: (huesped) => (
        <div className="persona">
          <Avatar nombre={huesped.nombre} grande />
          <div>
            <strong>{huesped.nombre}</strong>
            <span className="secundario">{huesped.email}</span>
          </div>
        </div>
      ),
    },
    {
      titulo: 'Documento',
      clase: 'sin-corte',
      render: (huesped) => (
        <>
          <span className="etiqueta-documento">{huesped.documento.tipo}</span>
          <span className="numero">{huesped.documento.numero}</span>
        </>
      ),
    },
    {
      titulo: 'Origen y contacto',
      render: (huesped) => (
        <>
          {huesped.ciudadOrigen}
          <span className="secundario">{huesped.telefono}</span>
        </>
      ),
    },
    { titulo: 'Estado', render: (huesped) => <InsigniaActivo activo={huesped.activo} /> },
    {
      titulo: 'Acciones',
      clase: 'acciones-fila',
      render: (huesped) => (
        <AccionesFila
          activo={huesped.activo}
          alEditar={() => gestion.abrirEdicion(huesped)}
          alAlternarActivo={() => gestion.alternarActivo(huesped)}
          alEliminar={() => gestion.pedirEliminar(huesped)}
        />
      ),
    },
  ];

  return (
    <Pagina
      etiqueta="Huéspedes"
      titulo="Huéspedes"
      descripcion="Personas que reservan en la red de hoteles."
      cifras={[
        { valor: resumen?.total, etiqueta: 'Huéspedes' },
        { valor: resumen?.activos, etiqueta: 'Activos' },
      ]}
      acciones={
        <Boton variante="dorado" onClick={gestion.abrirNuevo}>
          <IconoMas />
          Nuevo huésped
        </Boton>
      }
    >
      <div className="filtros">
        <Campo etiqueta="Buscar" tipo="search" placeholder="Nombre, correo o documento" {...listado.filtro('q')} />
        <Campo etiqueta="Ciudad de origen" placeholder="Ej. Bogotá" {...listado.filtro('ciudad')} />
        <Campo etiqueta="Estado" opciones={OPCIONES_ACTIVO} textoVacio="Todos" {...listado.filtro('activo')} />
      </div>

      <div className="titulo-listado">
        <h2>Directorio</h2>
        <span>
          {listado.total} {listado.total === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      <AlertaError error={gestion.errorAccion} />
      <Tabla columnas={columnas} filas={listado.filas} cargando={listado.cargando} error={listado.error} />
      <Paginacion pagina={listado.pagina} total={listado.total} alCambiar={listado.cambiarPagina} mostrarTotal={false} />

      {gestion.edicion && (
        <Modal
          etiqueta="Huéspedes"
          titulo={gestion.edicion === 'nuevo' ? 'Nuevo huésped' : 'Editar huésped'}
          descripcion="Datos de la persona que reserva."
          ancho="medio"
          alCerrar={gestion.cerrarEdicion}
        >
          <FormularioHuesped
            huesped={gestion.edicion === 'nuevo' ? null : gestion.edicion}
            alGuardar={gestion.guardar}
            alCancelar={gestion.cerrarEdicion}
          />
        </Modal>
      )}

      {gestion.aEliminar && (
        <ConfirmarAccion
          titulo="Eliminar huésped"
          mensaje={`¿Eliminar a ${gestion.aEliminar.nombre}? Esta acción no se puede deshacer.`}
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
