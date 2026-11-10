import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Boton from '../components/Boton.jsx';
import Campo from '../components/Campo.jsx';
import ChipsFiltro from '../components/ChipsFiltro.jsx';
import FormularioReserva from '../components/FormularioReserva.jsx';
import { IconoMas } from '../components/Iconos.jsx';
import { InsigniaEstadoReserva } from '../components/Insignia.jsx';
import MarcoFoto from '../components/MarcoFoto.jsx';
import Avatar from '../components/Avatar.jsx';
import Modal from '../components/Modal.jsx';
import Pagina from '../components/Pagina.jsx';
import Paginacion from '../components/Paginacion.jsx';
import Tabla from '../components/Tabla.jsx';
import { reservas } from '../api/recursos.js';
import { useAvisos } from '../context/AvisosContext.jsx';
import { useListado } from '../hooks/useListado.js';
import { useOpcionesDeHoteles } from '../hooks/useOpciones.js';
import { useResumenDeReservas } from '../hooks/useResumen.js';
import { ETIQUETAS_TIPO_HABITACION, OPCIONES_ESTADO_RESERVA } from '../utils/catalogos.js';
import { formatearFecha, formatearPesos } from '../utils/formato.js';
import { urlDeFoto } from '../utils/imagenes.js';

const FILTROS_INICIALES = { estado: '', hotelId: '', desde: '', hasta: '', huesped: '' };

export default function Reservas() {
  const listado = useListado(reservas.listar, FILTROS_INICIALES);
  const { resumen } = useResumenDeReservas();
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
        <div className="reserva-codigo">
          <Link to={`/reservas/${r._id}`}>{r.codigo}</Link>
          <InsigniaEstadoReserva estado={r.estado} />
        </div>
      ),
    },
    {
      titulo: 'Huésped',
      render: (r) => (
        <div className="persona">
          <Avatar nombre={r.huesped?.nombre} />
          <div>
            <strong>{r.huesped?.nombre}</strong>
            <span className="secundario">{r.huesped?.email}</span>
          </div>
        </div>
      ),
    },
    {
      titulo: 'Hotel y habitación',
      render: (r) => (
        <div className="persona">
          <MarcoFoto
            compacto
            relacion="13 / 10"
            className="miniatura-reserva"
            imagen={r.hotel?.imagenes?.[0] && urlDeFoto(r.hotel.imagenes[0].url, 'miniaturaReserva')}
            alt={r.hotel?.nombre}
          />
          <div>
            <strong>{r.hotel?.nombre}</strong>
            <span className="secundario">
              Hab. {r.habitacion.numero} · {ETIQUETAS_TIPO_HABITACION[r.habitacion.tipo]}
            </span>
          </div>
        </div>
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
      render: (r) => {
        const conSaldo = r.saldo > 0 && r.estado !== 'cancelada';
        const pagado = r.total ? Math.min(100, Math.round((r.totalPagado / r.total) * 100)) : 0;
        return (
          <>
            <span className="monto">{formatearPesos(r.total)}</span>
            <span className="secundario">{conSaldo ? `Saldo ${formatearPesos(r.saldo)}` : 'Sin saldo'}</span>
            <span className="progreso-mini" aria-hidden="true">
              <span className={conSaldo ? undefined : 'completo'} style={{ width: `${conSaldo ? pagado : 100}%` }} />
            </span>
          </>
        );
      },
    },
  ];

  return (
    <Pagina
      etiqueta="Reservas"
      titulo="Reservas"
      descripcion="Haz clic en el código de una reserva para ver su detalle, registrar pagos o cambiar su estado."
      cifras={[
        { valor: resumen?.total, etiqueta: 'Reservas' },
        { valor: resumen?.noCanceladas, etiqueta: 'No canceladas' },
      ]}
      acciones={
        <Boton variante="dorado" onClick={() => setCreando(true)}>
          <IconoMas />
          Nueva reserva
        </Boton>
      }
    >
      <div className="filtros filtros-con-chips">
        <ChipsFiltro
          etiqueta="Estado"
          opciones={OPCIONES_ESTADO_RESERVA}
          textoTodos={resumen ? `Todas · ${resumen.total}` : 'Todas'}
          {...listado.filtro('estado')}
        />
        <div className="filtros-campos">
          <Campo etiqueta="Huésped" tipo="search" placeholder="Nombre, correo o documento" {...listado.filtro('huesped')} />
          <Campo etiqueta="Hotel" opciones={opcionesDeHoteles} textoVacio="Todos" {...listado.filtro('hotelId')} />
          <Campo etiqueta="Entrada desde" tipo="date" {...listado.filtro('desde')} />
          <Campo etiqueta="Entrada hasta" tipo="date" {...listado.filtro('hasta')} />
        </div>
      </div>

      <Tabla columnas={columnas} filas={listado.filas} cargando={listado.cargando} error={listado.error} />
      <Paginacion pagina={listado.pagina} total={listado.total} alCambiar={listado.cambiarPagina} />

      {creando && (
        <Modal
          etiqueta="Reservas"
          titulo="Nueva reserva"
          descripcion="Elige fechas, habitación libre y huésped."
          ancho="ancho"
          alCerrar={() => setCreando(false)}
        >
          <FormularioReserva alGuardar={crear} alCancelar={() => setCreando(false)} />
        </Modal>
      )}
    </Pagina>
  );
}
