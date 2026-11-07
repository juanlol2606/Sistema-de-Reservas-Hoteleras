import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Campo from '../components/Campo.jsx';
import EncabezadoPagina from '../components/EncabezadoPagina.jsx';
import FormularioReserva from '../components/FormularioReserva.jsx';
import { InsigniaEstadoReserva } from '../components/Insignia.jsx';
import Modal from '../components/Modal.jsx';
import Paginacion from '../components/Paginacion.jsx';
import Tabla from '../components/Tabla.jsx';
import { reservas } from '../api/recursos.js';
import { useAvisos } from '../context/AvisosContext.jsx';
import { useListado } from '../hooks/useListado.js';
import { useOpcionesDeHoteles } from '../hooks/useOpciones.js';
import { ETIQUETAS_TIPO_HABITACION, OPCIONES_ESTADO_RESERVA } from '../utils/catalogos.js';
import { formatearFecha, formatearPesos } from '../utils/formato.js';

const FILTROS_INICIALES = { estado: '', hotelId: '', desde: '', hasta: '', huesped: '' };

export default function Reservas() {
  const listado = useListado(reservas.listar, FILTROS_INICIALES);
  const opcionesDeHoteles = useOpcionesDeHoteles();
  const { mostrarAviso } = useAvisos();
  const navegar = useNavigate();
  const [creando, setCreando] = useState(false);

  const crear = async (datos) => {
    const nueva = await reservas.crear(datos);
    mostrarAviso(`Reserva ${nueva.codigo} creada`);
    navegar(`/reservas/${nueva._id}`);
  };

  const columnas = [
    {
      titulo: 'Reserva',
      clase: 'sin-corte',
      render: (r) => (
        <>
          <Link to={`/reservas/${r._id}`}>{r.codigo}</Link>
          <span className="secundario">
            <InsigniaEstadoReserva estado={r.estado} />
          </span>
        </>
      ),
    },
    {
      titulo: 'Huésped',
      render: (r) => (
        <>
          <strong>{r.huesped?.nombre}</strong>
          <span className="secundario">{r.huesped?.email}</span>
        </>
      ),
    },
    {
      titulo: 'Hotel y habitación',
      render: (r) => (
        <>
          <strong>{r.hotel?.nombre}</strong>
          <span className="secundario">
            Hab. {r.habitacion.numero} · {ETIQUETAS_TIPO_HABITACION[r.habitacion.tipo]}
          </span>
        </>
      ),
    },
    {
      titulo: 'Estadía',
      clase: 'sin-corte',
      render: (r) => (
        <>
          {formatearFecha(r.fechaEntrada)} → {formatearFecha(r.fechaSalida)}
          <span className="secundario">
            {r.noches} {r.noches === 1 ? 'noche' : 'noches'}
          </span>
        </>
      ),
    },
    {
      titulo: 'Total',
      clase: 'derecha sin-corte',
      render: (r) => (
        <>
          {formatearPesos(r.total)}
          <span className="secundario">{r.saldo > 0 && r.estado !== 'cancelada' ? `Saldo ${formatearPesos(r.saldo)}` : 'Sin saldo'}</span>
        </>
      ),
    },
  ];

  return (
    <>
      <EncabezadoPagina titulo="Reservas" descripcion="Haz clic en el código de una reserva para ver su detalle, registrar pagos o cambiar su estado.">
        <button type="button" className="boton boton-primario" onClick={() => setCreando(true)}>
          Nueva reserva
        </button>
      </EncabezadoPagina>

      <div className="filtros">
        <Campo etiqueta="Huésped" tipo="search" placeholder="Nombre, correo o documento" {...listado.filtro('huesped')} />
        <Campo etiqueta="Estado" opciones={OPCIONES_ESTADO_RESERVA} textoVacio="Todos" {...listado.filtro('estado')} />
        <Campo etiqueta="Hotel" opciones={opcionesDeHoteles} textoVacio="Todos" {...listado.filtro('hotelId')} />
        <Campo etiqueta="Entrada desde" tipo="date" {...listado.filtro('desde')} />
        <Campo etiqueta="Entrada hasta" tipo="date" {...listado.filtro('hasta')} />
      </div>

      <Tabla columnas={columnas} filas={listado.filas} cargando={listado.cargando} error={listado.error} />
      <Paginacion pagina={listado.pagina} total={listado.total} alCambiar={listado.cambiarPagina} />

      {creando && (
        <Modal titulo="Nueva reserva" ancho="ancho" alCerrar={() => setCreando(false)}>
          <FormularioReserva alGuardar={crear} alCancelar={() => setCreando(false)} />
        </Modal>
      )}
    </>
  );
}
