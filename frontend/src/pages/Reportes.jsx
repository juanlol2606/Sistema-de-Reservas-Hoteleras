import { useMemo, useState } from 'react';
import Boton from '../components/Boton.jsx';
import Campo from '../components/Campo.jsx';
import Pagina from '../components/Pagina.jsx';
import TarjetaReporte from '../components/TarjetaReporte.jsx';
import {
  GraficaCancelaciones,
  GraficaIngresos,
  GraficaOcupacion,
  GraficaPagosPorMetodo,
  GraficaReservasPorCiudad,
  GraficaTiposHabitacion,
  GraficaTopHoteles,
  GraficaTopHuespedes,
  sumar,
} from '../components/graficas.jsx';
import { useRetraso } from '../hooks/useRetraso.js';
import { abreviarPesos, formatearPorcentaje, quitarVacios } from '../utils/formato.js';

const FILTROS_INICIALES = { desde: '', hasta: '', ciudad: '' };

export default function Reportes() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [cifras, setCifras] = useState({});
  const filtrosEstables = useRetraso(filtros);
  // Un objeto nuevo por cada cambio de filtros: es lo que hace que las tarjetas vuelvan a pedir sus datos.
  const parametros = useMemo(() => quitarVacios(filtrosEstables), [filtrosEstables]);

  const campo = (nombre) => ({
    nombre,
    valor: filtros[nombre],
    alCambiar: (valor) => setFiltros((anteriores) => ({ ...anteriores, [nombre]: valor })),
  });
  const hayFiltros = Object.values(filtros).some(Boolean);

  // Cada tarjeta avisa cuando carga y la cabecera toma de ahí sus cifras.
  const guardarCifra = (nombre, calcular) => (respuesta) => setCifras((anteriores) => ({ ...anteriores, [nombre]: respuesta ? calcular(respuesta) : undefined }));

  return (
    <Pagina
      etiqueta="Indicadores"
      titulo="Reportes"
      descripcion="Indicadores calculados en la base de datos con aggregation pipelines."
      cifras={[
        { valor: cifras.cobrado === undefined ? null : `$ ${abreviarPesos(cifras.cobrado)}`, etiqueta: 'Cobrado' },
        { valor: cifras.reservas, etiqueta: 'Reservas' },
        { valor: cifras.ocupacion === undefined ? null : formatearPorcentaje(cifras.ocupacion), etiqueta: 'Ocupación', resaltada: true },
      ]}
    >
      <div className="filtros">
        <Campo etiqueta="Desde" tipo="date" {...campo('desde')} />
        <Campo etiqueta="Hasta" tipo="date" {...campo('hasta')} />
        <Campo etiqueta="Ciudad" placeholder="Ej. Cartagena" {...campo('ciudad')} />
        <div className="campo">
          <label>&nbsp;</label>
          <Boton className="boton-de-campo" onClick={() => setFiltros(FILTROS_INICIALES)} disabled={!hayFiltros}>
            Limpiar filtros
          </Boton>
        </div>
      </div>
      <p className="nota">
        Los reportes de dinero filtran por la fecha del pago; los de reservas, por la fecha de entrada. La ocupación usa los últimos 30 días si no eliges fechas.
      </p>

      <div className="rejilla-reportes">
        <TarjetaReporte
          ancha
          reporte="ingresos-por-mes"
          titulo="Ingresos por mes"
          pregunta="¿Cuánto dinero cobró cada hotel en cada mes?"
          filtros={parametros}
          alCargar={guardarCifra('cobrado', ({ data }) => sumar(data, 'ingresos'))}
        >
          {({ data }) => <GraficaIngresos data={data} />}
        </TarjetaReporte>

        <TarjetaReporte
          reporte="reservas-por-ciudad"
          titulo="Reservas por ciudad"
          pregunta="¿En qué ciudades se concentran las reservas? (la ciudad no aplica aquí)"
          filtros={parametros}
          alCargar={guardarCifra('reservas', ({ data }) => sumar(data, 'reservas'))}
        >
          {({ data }) => <GraficaReservasPorCiudad data={data} />}
        </TarjetaReporte>

        <TarjetaReporte reporte="top-hoteles" titulo="Hoteles mejor calificados" pregunta="Promedio de reseñas, con al menos 3 reseñas (máximo 5 hoteles)." filtros={parametros}>
          {({ data }) => <GraficaTopHoteles data={data} />}
        </TarjetaReporte>

        <TarjetaReporte reporte="tipos-habitacion" titulo="Tipos de habitación" pregunta="¿Qué tipos se venden más y a qué precio medio por noche?" filtros={parametros}>
          {({ data }) => <GraficaTiposHabitacion data={data} />}
        </TarjetaReporte>

        <TarjetaReporte reporte="cancelaciones" titulo="Tasa de cancelación" pregunta="¿Qué porcentaje de las reservas de cada hotel termina cancelado?" filtros={parametros}>
          {({ data }) => <GraficaCancelaciones data={data} />}
        </TarjetaReporte>

        <TarjetaReporte reporte="top-huespedes" titulo="Huéspedes que más pagan" pregunta="Los 10 huéspedes con mayor total pagado." filtros={parametros}>
          {({ data }) => <GraficaTopHuespedes data={data} />}
        </TarjetaReporte>

        <TarjetaReporte reporte="pagos-por-metodo" titulo="Pagos por método" pregunta="¿Por qué medio pagan los huéspedes y cuánto aporta cada uno?" filtros={parametros}>
          {({ data }) => <GraficaPagosPorMetodo data={data} />}
        </TarjetaReporte>

        <TarjetaReporte
          ancha
          reporte="ocupacion"
          titulo="Ocupación"
          pregunta="¿Qué porcentaje de las noches disponibles de cada hotel se vendió?"
          filtros={parametros}
          alCargar={guardarCifra('ocupacion', (respuesta) => respuesta.total?.ocupacion)}
        >
          {(respuesta) => <GraficaOcupacion respuesta={respuesta} />}
        </TarjetaReporte>
      </div>
    </Pagina>
  );
}
