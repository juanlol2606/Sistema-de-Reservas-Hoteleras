import { Bar, BarChart, CartesianGrid, Cell, Legend, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ETIQUETAS_METODO_PAGO, ETIQUETAS_TIPO_HABITACION } from '../utils/catalogos.js';
import { formatearMes, formatearPesos } from '../utils/formato.js';
import TablaDatos from './TablaDatos.jsx';

const PALETA = ['#0f766e', '#d97706', '#4f46e5', '#db2777', '#475569', '#16a34a', '#0891b2', '#9333ea'];
const COLOR_EJE = '#5b6b7b';
const ALTURA = 300;

const sumar = (filas, campo) => filas.reduce((suma, fila) => suma + fila[campo], 0);
const abreviarPesos = (valor) => (valor >= 1_000_000 ? `${(valor / 1_000_000).toFixed(1)} M` : `${Math.round(valor / 1000)} mil`);
const alturaHorizontal = (filas) => Math.max(180, filas.length * 44 + 40);

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
function BarrasHorizontales({ filas, etiqueta, valor, formato, color = PALETA[0], dominio }) {
  return (
    <ResponsiveContainer width="100%" height={alturaHorizontal(filas)}>
      <BarChart data={filas} layout="vertical" margin={{ left: 8, right: 64 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" hide domain={dominio} />
        <YAxis type="category" dataKey={etiqueta} width={150} tick={{ fill: COLOR_EJE, fontSize: 12 }} tickLine={false} />
        <Tooltip formatter={(v) => formato(v)} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey={valor} fill={color} radius={[0, 4, 4, 0]}>
          <LabelList dataKey={valor} position="right" formatter={formato} fill={COLOR_EJE} fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficaIngresos({ data }) {
  const meses = [...new Set(data.map((fila) => fila.mes))].sort();
  const hoteles = [...new Set(data.map((fila) => fila.hotel))].sort();
  const filas = meses.map((mes) => ({
    mes,
    ...Object.fromEntries(data.filter((fila) => fila.mes === mes).map((fila) => [fila.hotel, fila.ingresos])),
  }));

  return (
    <>
      <Cifras cifras={[{ valor: formatearPesos(sumar(data, 'ingresos')), etiqueta: 'cobrado en el periodo' }, { valor: sumar(data, 'pagos'), etiqueta: 'pagos registrados' }]} />
      <ResponsiveContainer width="100%" height={ALTURA}>
        <BarChart data={filas}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="mes" tickFormatter={formatearMes} tick={{ fill: COLOR_EJE, fontSize: 12 }} />
          <YAxis tickFormatter={abreviarPesos} width={64} tick={{ fill: COLOR_EJE, fontSize: 12 }} />
          <Tooltip formatter={(v, nombre) => [formatearPesos(v), nombre]} labelFormatter={formatearMes} />
          <Legend />
          {hoteles.map((hotel, i) => (
            <Bar key={hotel} dataKey={hotel} stackId="ingresos" fill={PALETA[i % PALETA.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
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
      <BarrasHorizontales filas={data} etiqueta="ciudad" valor="reservas" formato={(v) => `${v}`} />
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
      <BarrasHorizontales filas={data} etiqueta="hotel" valor="promedio" formato={(v) => v.toFixed(2)} dominio={[0, 5]} color={PALETA[1]} />
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
  return (
    <>
      <Cifras cifras={filas.map((fila) => ({ valor: formatearPesos(fila.precioMedioNoche), etiqueta: `${fila.nombre}: precio medio por noche` }))} />
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={filas}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="nombre" tick={{ fill: COLOR_EJE, fontSize: 12 }} />
          <YAxis tickFormatter={abreviarPesos} width={64} tick={{ fill: COLOR_EJE, fontSize: 12 }} />
          <Tooltip formatter={(v) => formatearPesos(v)} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="ventas" name="Ventas" radius={[4, 4, 0, 0]}>
            {filas.map((fila, i) => (
              <Cell key={fila.tipo} fill={PALETA[i % PALETA.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
      <BarrasHorizontales filas={data} etiqueta="hotel" valor="tasaCancelacion" formato={(v) => `${v} %`} color={PALETA[3]} dominio={[0, 'dataMax + 5']} />
      <TablaDatos
        filas={data}
        columnas={[
          { titulo: 'Hotel', render: (f) => f.hotel },
          { titulo: 'Reservas', clase: 'derecha', render: (f) => f.reservas },
          { titulo: 'Canceladas', clase: 'derecha', render: (f) => f.canceladas },
          { titulo: 'Tasa', clase: 'derecha', render: (f) => `${f.tasaCancelacion} %` },
        ]}
      />
    </>
  );
}

export function GraficaTopHuespedes({ data }) {
  return (
    <>
      <BarrasHorizontales filas={data} etiqueta="huesped" valor="gasto" formato={formatearPesos} color={PALETA[2]} />
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
  return (
    <>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart margin={{ top: 10, right: 90, bottom: 10, left: 90 }}>
          <Pie data={filas} dataKey="monto" nameKey="nombre" innerRadius={55} outerRadius={90} paddingAngle={2} label={({ nombre, participacion }) => `${nombre} ${participacion} %`}>
            {filas.map((fila, i) => (
              <Cell key={fila.metodo} fill={PALETA[i % PALETA.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatearPesos(v)} />
        </PieChart>
      </ResponsiveContainer>
      <TablaDatos
        filas={filas}
        columnas={[
          { titulo: 'Método', render: (f) => f.nombre },
          { titulo: 'Pagos', clase: 'derecha', render: (f) => f.pagos },
          { titulo: 'Monto', clase: 'derecha', render: (f) => formatearPesos(f.monto) },
          { titulo: 'Promedio', clase: 'derecha', render: (f) => formatearPesos(f.promedio) },
          { titulo: 'Participación', clase: 'derecha', render: (f) => `${f.participacion} %` },
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
          { valor: `${total.ocupacion} %`, etiqueta: `ocupación de la red en ${filtros.dias} días` },
          { valor: total.nochesVendidas, etiqueta: 'noches vendidas' },
          { valor: total.nochesDisponibles, etiqueta: 'noches disponibles' },
        ]}
      />
      <BarrasHorizontales filas={data} etiqueta="hotel" valor="ocupacion" formato={(v) => `${v} %`} color={PALETA[5]} dominio={[0, 'dataMax + 5']} />
      <TablaDatos
        filas={data}
        columnas={[
          { titulo: 'Hotel', render: (f) => f.hotel },
          { titulo: 'Habitaciones', clase: 'derecha', render: (f) => f.habitaciones },
          { titulo: 'Noches disponibles', clase: 'derecha', render: (f) => f.nochesDisponibles },
          { titulo: 'Noches vendidas', clase: 'derecha', render: (f) => f.nochesVendidas },
          { titulo: 'Ocupación', clase: 'derecha', render: (f) => `${f.ocupacion} %` },
        ]}
      />
    </>
  );
}
