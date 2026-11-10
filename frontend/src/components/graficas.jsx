import { ETIQUETAS_METODO_PAGO, ETIQUETAS_TIPO_HABITACION } from '../utils/catalogos.js';
import { abreviarPesos, formatearMes, formatearMesCorto, formatearPesos, formatearPorcentaje } from '../utils/formato.js';
import TablaDatos from './TablaDatos.jsx';

const COLORES = ['var(--grafica-verde)', 'var(--grafica-ambar)', 'var(--grafica-azul)', 'var(--grafica-ladrillo)'];
const AMBAR = COLORES[1];
// La barra más larga ocupa este porcentaje del espacio: deja sitio para el número que la acompaña.
const ESCALA = 85;

export const sumar = (filas, campo) => filas.reduce((suma, fila) => suma + fila[campo], 0);

function Cifras({ cifras }) {
  return (
    <div className="cifras-destacadas">
      {cifras.map(({ valor, etiqueta }) => (
        <div key={etiqueta} className="cifra-destacada">
          <strong>{valor}</strong>
          <span>{etiqueta}</span>
        </div>
      ))}
    </div>
  );
}

// Barras horizontales: ideales cuando las etiquetas (hoteles, ciudades, huéspedes) son largas.
function BarrasHorizontales({ filas, etiqueta, valor, formato, color = COLORES[0], dominio }) {
  const maximo = dominio ?? Math.max(...filas.map((fila) => fila[valor]), 1);

  return (
    <div className="barras-h">
      {filas.map((fila, indice) => (
        <div key={`${fila[etiqueta]}-${indice}`} className="barra-h">
          <span className="barra-h-etiqueta">{fila[etiqueta]}</span>
          <div className="barra-h-pista">
            <span className="barra-h-relleno" style={{ width: `${(fila[valor] / maximo) * ESCALA}%`, background: color }} />
            <span className="barra-h-valor">{formato(fila[valor])}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Columnas: [{ etiqueta, valor, color }].
function BarrasVerticales({ columnas, formato, descripcion, alto }) {
  const maximo = Math.max(...columnas.map((columna) => columna.valor), 1);

  return (
    <div className="barras-v" role="img" aria-label={descripcion} style={{ '--alto': `${alto}px` }}>
      <div className="barras-v-guias" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((guia) => (
          <span key={guia} />
        ))}
      </div>
      <div className="barras-v-columnas">
        {columnas.map((columna) => (
          <div key={columna.etiqueta} className="barra-v">
            <div className="barra-v-zona">
              <span className="barra-v-barra" style={{ height: `${(columna.valor / maximo) * ESCALA}%`, background: columna.color }}>
                <span className="barra-v-valor">{formato(columna.valor)}</span>
              </span>
            </div>
            <span className="barra-v-etiqueta">{columna.etiqueta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Segmentos: [{ nombre, porcentaje, color }]. El anillo es un conic-gradient; el centro muestra `centro`.
function Dona({ segmentos, centro, descripcion }) {
  let acumulado = 0;
  const tramos = segmentos.map(({ color, porcentaje }) => {
    const inicio = acumulado;
    acumulado += porcentaje;
    return `${color} ${inicio}% ${acumulado}%`;
  });

  return (
    <div className="dona-contenedor">
      <div className="dona" role="img" aria-label={descripcion} style={{ background: `conic-gradient(${tramos.join(', ')})` }}>
        <div className="dona-centro">
          <strong>{centro.valor}</strong>
          <span>{centro.etiqueta}</span>
        </div>
      </div>
      <ul className="leyenda">
        {segmentos.map(({ nombre, porcentaje, color }) => (
          <li key={nombre}>
            <span className="leyenda-color" style={{ background: color }} aria-hidden="true" />
            <span className="leyenda-nombre">{nombre}</span>
            <strong>{formatearPorcentaje(porcentaje)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GraficaIngresos({ data }) {
  const totalesPorMes = [...data.reduce((porMes, fila) => porMes.set(fila.mes, (porMes.get(fila.mes) ?? 0) + fila.ingresos), new Map())].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const columnas = totalesPorMes.map(([mes, total]) => ({ etiqueta: formatearMesCorto(mes), valor: total, color: AMBAR }));

  return (
    <>
      <Cifras cifras={[{ valor: formatearPesos(sumar(data, 'ingresos')), etiqueta: 'cobrado en el periodo' }, { valor: sumar(data, 'pagos'), etiqueta: 'pagos registrados' }]} />
      <BarrasVerticales
        columnas={columnas}
        formato={abreviarPesos}
        alto={280}
        descripcion={`Ingresos por mes: ${columnas.map((c) => `${c.etiqueta} ${abreviarPesos(c.valor)}`).join(', ')}`}
      />
      <TablaDatos
        filas={data}
        columnas={[
          { titulo: 'Mes', render: (f) => formatearMes(f.mes) },
          { titulo: 'Hotel', render: (f) => f.hotel },
          { titulo: 'Pagos', clase: 'derecha', render: (f) => f.pagos },
          { titulo: 'Ingresos', clase: 'derecha', render: (f) => formatearPesos(f.ingresos) },
        ]}
      />
    </>
  );
}

export function GraficaReservasPorCiudad({ data }) {
  return (
    <>
      <Cifras cifras={[{ valor: sumar(data, 'reservas'), etiqueta: 'reservas no canceladas' }, { valor: formatearPesos(sumar(data, 'valorReservado')), etiqueta: 'valor reservado' }]} />
      <BarrasHorizontales filas={data} etiqueta="ciudad" valor="reservas" formato={String} />
      <TablaDatos
        filas={data}
        columnas={[
          { titulo: 'Ciudad', render: (f) => f.ciudad },
          { titulo: 'Hoteles', clase: 'derecha', render: (f) => f.hoteles },
          { titulo: 'Reservas', clase: 'derecha', render: (f) => f.reservas },
          { titulo: 'Noches', clase: 'derecha', render: (f) => f.noches },
          { titulo: 'Valor reservado', clase: 'derecha', render: (f) => formatearPesos(f.valorReservado) },
        ]}
      />
    </>
  );
}

export function GraficaTopHoteles({ data }) {
  return (
    <>
      <BarrasHorizontales filas={data} etiqueta="hotel" valor="promedio" formato={(v) => v.toFixed(2)} dominio={5} color={AMBAR} />
      <TablaDatos
        filas={data}
        columnas={[
          { titulo: 'Hotel', render: (f) => f.hotel },
          { titulo: 'Ciudad', render: (f) => f.ciudad },
          { titulo: 'Promedio', clase: 'derecha', render: (f) => f.promedio.toFixed(2) },
          { titulo: 'Reseñas', clase: 'derecha', render: (f) => f.resenas },
        ]}
      />
    </>
  );
}

export function GraficaTiposHabitacion({ data }) {
  const filas = data.map((fila) => ({ ...fila, nombre: ETIQUETAS_TIPO_HABITACION[fila.tipo] }));
  const columnas = filas.map((fila, indice) => ({ etiqueta: fila.nombre, valor: fila.ventas, color: COLORES[indice % COLORES.length] }));

  return (
    <>
      <Cifras cifras={filas.map((fila) => ({ valor: formatearPesos(fila.precioMedioNoche), etiqueta: `${fila.nombre} · precio medio` }))} />
      <BarrasVerticales
        columnas={columnas}
        formato={abreviarPesos}
        alto={200}
        descripcion={`Ingresos por tipo: ${columnas.map((c) => `${c.etiqueta} ${abreviarPesos(c.valor)}`).join(', ')}`}
      />
      <TablaDatos
        filas={filas}
        columnas={[
          { titulo: 'Tipo', render: (f) => f.nombre },
          { titulo: 'Reservas', clase: 'derecha', render: (f) => f.reservas },
          { titulo: 'Noches', clase: 'derecha', render: (f) => f.noches },
          { titulo: 'Ventas', clase: 'derecha', render: (f) => formatearPesos(f.ventas) },
          { titulo: 'Precio medio', clase: 'derecha', render: (f) => formatearPesos(f.precioMedioNoche) },
        ]}
      />
    </>
  );
}

export function GraficaCancelaciones({ data }) {
  return (
    <>
      <BarrasHorizontales filas={data} etiqueta="hotel" valor="tasaCancelacion" formato={formatearPorcentaje} color={COLORES[3]} />
      <TablaDatos
        filas={data}
        columnas={[
          { titulo: 'Hotel', render: (f) => f.hotel },
          { titulo: 'Reservas', clase: 'derecha', render: (f) => f.reservas },
          { titulo: 'Canceladas', clase: 'derecha', render: (f) => f.canceladas },
          { titulo: 'Tasa', clase: 'derecha', render: (f) => formatearPorcentaje(f.tasaCancelacion) },
        ]}
      />
    </>
  );
}

export function GraficaTopHuespedes({ data }) {
  return (
    <>
      <BarrasHorizontales filas={data} etiqueta="huesped" valor="gasto" formato={formatearPesos} color={COLORES[2]} />
      <TablaDatos
        filas={data}
        columnas={[
          { titulo: 'Huésped', render: (f) => f.huesped },
          { titulo: 'Ciudad de origen', render: (f) => f.ciudadOrigen },
          { titulo: 'Reservas', clase: 'derecha', render: (f) => f.reservas },
          { titulo: 'Pagado', clase: 'derecha', render: (f) => formatearPesos(f.gasto) },
        ]}
      />
    </>
  );
}

export function GraficaPagosPorMetodo({ data }) {
  const filas = data.map((fila) => ({ ...fila, nombre: ETIQUETAS_METODO_PAGO[fila.metodo] }));
  const segmentos = filas.map((fila, indice) => ({ nombre: fila.nombre, porcentaje: fila.participacion, color: COLORES[indice % COLORES.length] }));

  return (
    <>
      <Dona
        segmentos={segmentos}
        centro={{ valor: sumar(data, 'pagos'), etiqueta: 'pagos' }}
        descripcion={`Pagos por método: ${segmentos.map((s) => `${s.nombre} ${formatearPorcentaje(s.porcentaje)}`).join(', ')}`}
      />
      <TablaDatos
        filas={filas}
        columnas={[
          { titulo: 'Método', render: (f) => f.nombre },
          { titulo: 'Pagos', clase: 'derecha', render: (f) => f.pagos },
          { titulo: 'Monto', clase: 'derecha', render: (f) => formatearPesos(f.monto) },
          { titulo: 'Promedio', clase: 'derecha', render: (f) => formatearPesos(f.promedio) },
          { titulo: 'Participación', clase: 'derecha', render: (f) => formatearPorcentaje(f.participacion) },
        ]}
      />
    </>
  );
}

export function GraficaOcupacion({ respuesta }) {
  const { data, total, filtros } = respuesta;
  return (
    <>
      <Cifras
        cifras={[
          { valor: formatearPorcentaje(total.ocupacion), etiqueta: `ocupación de la red en ${filtros.dias} días` },
          { valor: total.nochesVendidas, etiqueta: 'noches vendidas' },
          { valor: total.nochesDisponibles, etiqueta: 'noches disponibles' },
        ]}
      />
      <BarrasHorizontales filas={data} etiqueta="hotel" valor="ocupacion" formato={formatearPorcentaje} color={COLORES[0]} />
      <TablaDatos
        filas={data}
        columnas={[
          { titulo: 'Hotel', render: (f) => f.hotel },
          { titulo: 'Habitaciones', clase: 'derecha', render: (f) => f.habitaciones },
          { titulo: 'Noches disponibles', clase: 'derecha', render: (f) => f.nochesDisponibles },
          { titulo: 'Noches vendidas', clase: 'derecha', render: (f) => f.nochesVendidas },
          { titulo: 'Ocupación', clase: 'derecha', render: (f) => formatearPorcentaje(f.ocupacion) },
        ]}
      />
    </>
  );
}
