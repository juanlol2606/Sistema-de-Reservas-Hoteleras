import { useState } from 'react';
import { reservas } from '../api/recursos.js';
import Boton from '../components/Boton.jsx';
import Campo from '../components/Campo.jsx';
import ChipsFiltro from '../components/ChipsFiltro.jsx';
import EstadoListado from '../components/EstadoListado.jsx';
import FormularioReserva from '../components/FormularioReserva.jsx';
import Modal from '../components/Modal.jsx';
import Pagina from '../components/Pagina.jsx';
import Popover, { posicionDelClic } from '../components/Popover.jsx';
import TableroCalendario from '../components/TableroCalendario.jsx';
import { useAvisos } from '../context/AvisosContext.jsx';
import { useCalendario } from '../hooks/useCalendario.js';
import { ETIQUETAS_ESTADO_RESERVA, OPCIONES_DIAS_CALENDARIO, OPCIONES_TIPO_HABITACION } from '../utils/catalogos.js';
import {
  aValorDeFecha,
  describirRango,
  formatearDiaCorto,
  formatearPesos,
  formatearPorcentaje,
  hoyEnBogota,
  sumarDiasATexto,
} from '../utils/formato.js';

const ESTADOS_EN_LEYENDA = ['pendiente', 'confirmada', 'en_curso', 'finalizada'];

function tarjetasDeResumen(resumen) {
  return [
    { etiqueta: 'Ocupación del periodo', valor: resumen && formatearPorcentaje(resumen.ocupacionPeriodo) },
    { etiqueta: 'Libres esta noche', valor: resumen && `${resumen.libresEstaNoche} de ${resumen.enServicio}` },
    { etiqueta: 'Llegadas hoy', valor: resumen?.llegadasHoy },
    { etiqueta: 'Salidas hoy', valor: resumen?.salidasHoy },
  ];
}

function textoSinHabitaciones({ cargando, hayHoteles, hotelId, tipo }) {
  if (!cargando && !hayHoteles) return 'Todavía no hay hoteles.';
  if (!hotelId) return 'Elige un hotel para ver su calendario.';
  return tipo ? 'Este hotel no tiene habitaciones de ese tipo.' : 'Este hotel todavía no tiene habitaciones.';
}

export default function Calendario() {
  const calendario = useCalendario();
  const { mostrarAviso } = useAvisos();
  const [seleccion, setSeleccion] = useState(null);
  const [nuevaReserva, setNuevaReserva] = useState(null);

  const { filtros, hasta, datos, cargando, error } = calendario;
  const hoy = hoyEnBogota();
  const sinHabitaciones = !datos || datos.habitaciones.length === 0;

  const elegirReserva = (reserva, habitacion, evento) => setSeleccion({ tipo: 'reserva', reserva, habitacion, ...posicionDelClic(evento) });
  const elegirCelda = (habitacion, noche, evento) => setSeleccion({ tipo: 'celda', habitacion, noche, ...posicionDelClic(evento) });
  const cerrarSeleccion = () => setSeleccion(null);

  const abrirFormulario = () => {
    const { habitacion, noche } = seleccion;
    setNuevaReserva({ hotelId: datos.hotel._id, habitacionId: habitacion._id, fechaEntrada: noche, fechaSalida: sumarDiasATexto(noche, 1) });
    cerrarSeleccion();
  };

  const crear = async (valores) => {
    const nueva = await reservas.crear(valores);
    setNuevaReserva(null);
    mostrarAviso(`Reserva ${nueva.codigo} creada`);
    calendario.recargar();
  };

  return (
    <Pagina etiqueta="Ocupación" titulo="Calendario de ocupación" descripcion="Qué habitaciones están libres u ocupadas, noche por noche.">
      <div className="filtros calendario-controles">
        <div className="calendario-grupo">
          <Campo
            etiqueta="Hotel"
            nombre="hotelId"
            opciones={calendario.opcionesDeHoteles}
            textoVacio="Elige un hotel"
            valor={filtros.hotelId}
            alCambiar={(hotelId) => calendario.cambiar({ hotelId })}
          />
          <Campo
            etiqueta="Tipo"
            nombre="tipo"
            opciones={OPCIONES_TIPO_HABITACION}
            textoVacio="Todos"
            valor={filtros.tipo}
            alCambiar={(tipo) => calendario.cambiar({ tipo })}
          />
        </div>
        <div className="calendario-grupo calendario-navegacion">
          <Boton aria-label="Periodo anterior" onClick={() => calendario.mover(-1)}>
            ←
          </Boton>
          <span className="calendario-rango">{describirRango(filtros.desde, hasta)}</span>
          <Boton aria-label="Periodo siguiente" onClick={() => calendario.mover(1)}>
            →
          </Boton>
          <Boton variante="oscuro" onClick={calendario.irAHoy}>
            Hoy
          </Boton>
          <ChipsFiltro
            etiqueta="Días visibles"
            opciones={OPCIONES_DIAS_CALENDARIO}
            conTodos={false}
            valor={String(filtros.dias)}
            alCambiar={(dias) => calendario.cambiar({ dias: Number(dias) })}
          />
        </div>
      </div>

      <div className="calendario-resumen">
        {tarjetasDeResumen(datos?.resumen).map(({ etiqueta, valor }) => (
          <div key={etiqueta} className="tarjeta calendario-kpi">
            <strong>{valor ?? '—'}</strong>
            <span>{etiqueta}</span>
          </div>
        ))}
      </div>

      <EstadoListado
        cargando={cargando}
        error={error}
        vacio={sinHabitaciones}
        textoVacio={textoSinHabitaciones({ cargando, hayHoteles: calendario.hayHoteles, hotelId: filtros.hotelId, tipo: filtros.tipo })}
      />

      {!sinHabitaciones && (
        <>
          <div className={cargando ? 'calendario-cargando' : undefined}>
            <TableroCalendario datos={datos} hoy={hoy} alElegirReserva={elegirReserva} alElegirCelda={elegirCelda} />
          </div>
          <div className="calendario-leyenda">
            {ESTADOS_EN_LEYENDA.map((estado) => (
              <span key={estado}>
                <i className={`cal-${estado}`} />
                {ETIQUETAS_ESTADO_RESERVA[estado]}
              </span>
            ))}
            <span>
              <i className="calendario-leyenda-mantenimiento" />
              En mantenimiento
            </span>
            <span>· Borde punteado: la reserva sigue fuera del rango visible</span>
          </div>
        </>
      )}

      {seleccion?.tipo === 'reserva' && (
        <Popover x={seleccion.x} y={seleccion.y} etiqueta={`Reserva ${seleccion.reserva.codigo}`} alCerrar={cerrarSeleccion}>
          <span className={`calendario-estado cal-${seleccion.reserva.estado}`}>{ETIQUETAS_ESTADO_RESERVA[seleccion.reserva.estado]}</span>
          <h3>{seleccion.reserva.huesped.nombre}</h3>
          <dl>
            <dt>Reserva</dt>
            <dd>{seleccion.reserva.codigo}</dd>
            <dt>Habitación</dt>
            <dd>{seleccion.habitacion.numero}</dd>
            <dt>Entrada</dt>
            <dd>{formatearDiaCorto(aValorDeFecha(seleccion.reserva.fechaEntrada))}</dd>
            <dt>Salida</dt>
            <dd>{formatearDiaCorto(aValorDeFecha(seleccion.reserva.fechaSalida))}</dd>
            <dt>Noches</dt>
            <dd>{seleccion.reserva.noches}</dd>
            <dt>Saldo</dt>
            <dd>{formatearPesos(seleccion.reserva.saldo)}</dd>
          </dl>
          <div className="acciones">
            <Boton onClick={cerrarSeleccion}>Cerrar</Boton>
            <Boton variante="oscuro" a={`/reservas/${seleccion.reserva._id}`}>
              Ver reserva →
            </Boton>
          </div>
        </Popover>
      )}

      {seleccion?.tipo === 'celda' && (
        <Popover x={seleccion.x} y={seleccion.y} etiqueta={`Habitación ${seleccion.habitacion.numero} libre`} alCerrar={cerrarSeleccion}>
          <h3>Habitación {seleccion.habitacion.numero}</h3>
          <p className="texto-suave texto-pequeno">
            Libre la noche del {formatearDiaCorto(seleccion.noche)}. Se abrirá el formulario con la habitación y las fechas ya puestas (entrada{' '}
            {formatearDiaCorto(seleccion.noche)}, salida {formatearDiaCorto(sumarDiasATexto(seleccion.noche, 1))}).
          </p>
          <div className="acciones">
            <Boton onClick={cerrarSeleccion}>Cancelar</Boton>
            <Boton variante="oscuro" onClick={abrirFormulario}>
              Crear reserva aquí
            </Boton>
          </div>
        </Popover>
      )}

      {nuevaReserva && (
        <Modal
          etiqueta="Calendario"
          titulo="Nueva reserva"
          descripcion="Revisa la habitación y las fechas, y elige al huésped."
          ancho="ancho"
          alCerrar={() => setNuevaReserva(null)}
        >
          <FormularioReserva valoresIniciales={nuevaReserva} alGuardar={crear} alCancelar={() => setNuevaReserva(null)} />
        </Modal>
      )}
    </Pagina>
  );
}
