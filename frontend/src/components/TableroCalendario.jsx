import { Fragment, useMemo } from 'react';
import { ETIQUETAS_TIPO_HABITACION_PLURAL } from '../utils/catalogos.js';
import { aValorDeFecha, diaDeLaSemana, diasEntre, esFinDeSemana, formatearDiaCorto, formatearPesos } from '../utils/formato.js';

const enServicio = (habitacion) => habitacion.activo && habitacion.estado === 'disponible';
const motivoFueraDeServicio = (habitacion) => (habitacion.activo ? 'En mantenimiento' : 'Inactiva');
const primerNombre = (nombre) => nombre?.split(' ')[0];

// Dónde cae una reserva en el rango: columnas desde `primera` hasta `fin` (exclusivo) y de qué lado se recorta.
function ubicar(reserva, desde, dias) {
  const entrada = diasEntre(desde, aValorDeFecha(reserva.fechaEntrada));
  const salida = diasEntre(desde, aValorDeFecha(reserva.fechaSalida));
  return { reserva, primera: Math.max(entrada, 0), fin: Math.min(salida, dias), cortadaIzquierda: entrada < 0, cortadaDerecha: salida > dias };
}

function armarFilas({ habitaciones, reservas, rango }) {
  const barrasPorHabitacion = new Map();
  reservas.forEach((reserva) => {
    const barra = ubicar(reserva, rango.desde, rango.dias);
    if (barra.fin <= barra.primera) return;
    barrasPorHabitacion.set(reserva.habitacionId, [...(barrasPorHabitacion.get(reserva.habitacionId) ?? []), barra]);
  });

  return habitaciones.map((habitacion) => {
    const barras = barrasPorHabitacion.get(habitacion._id) ?? [];
    const nochesOcupadas = new Set(barras.flatMap(({ primera, fin }) => Array.from({ length: fin - primera }, (_, i) => primera + i)));
    return { habitacion, barras, nochesOcupadas };
  });
}

// Tablero noche por noche: una fila por habitación (agrupadas por tipo), una columna por noche y las reservas como barras.
// `hoy` es AAAA-MM-DD. Las celdas libres de hoy en adelante abren `alElegirCelda`; las barras, `alElegirReserva`.
export default function TableroCalendario({ datos, hoy, alElegirReserva, alElegirCelda }) {
  const { rango, ocupacionPorNoche } = datos;
  const noches = ocupacionPorNoche.map((noche) => noche.fecha);
  const filas = useMemo(() => armarFilas(datos), [datos]);

  const clasesDeNoche = (noche) => (noche === hoy ? ' calendario-hoy' : esFinDeSemana(noche) ? ' calendario-finde' : '');

  return (
    <div className="calendario-tablero">
      <div className="calendario-scroll" tabIndex={0} role="region" aria-label="Calendario de ocupación">
        <div className="calendario-contenido" style={{ '--dias': rango.dias }}>
          <div className="calendario-fila">
            <div className="calendario-esquina">Habitación</div>
            {noches.map((noche) => (
              <div key={noche} className={`calendario-dia${clasesDeNoche(noche)}`}>
                {diaDeLaSemana(noche)}
                <b>{Number(noche.slice(8))}</b>
              </div>
            ))}
          </div>

          {filas.map(({ habitacion, barras, nochesOcupadas }, indice) => {
            const nuevoGrupo = indice === 0 || filas[indice - 1].habitacion.tipo !== habitacion.tipo;
            const enUso = enServicio(habitacion);
            return (
              <Fragment key={habitacion._id}>
                {nuevoGrupo && (
                  <div className="calendario-grupo-tipo">
                    <span>{ETIQUETAS_TIPO_HABITACION_PLURAL[habitacion.tipo]}</span>
                  </div>
                )}
                <div className="calendario-fila">
                  <div className="calendario-habitacion">
                    <b>Hab. {habitacion.numero}</b>
                    <small>
                      {habitacion.capacidad} pers · {formatearPesos(habitacion.precioNoche)}
                    </small>
                  </div>

                  {noches.map((noche, i) => {
                    const posicion = { gridColumn: i + 2 };
                    const libre = enUso && !nochesOcupadas.has(i) && noche >= hoy;
                    if (!libre) return <div key={noche} className={`calendario-celda${clasesDeNoche(noche)}`} style={posicion} />;
                    return (
                      <button
                        key={noche}
                        type="button"
                        className={`calendario-celda calendario-celda-libre${clasesDeNoche(noche)}`}
                        style={posicion}
                        aria-label={`Habitación ${habitacion.numero}, noche del ${formatearDiaCorto(noche)}: libre. Crear reserva`}
                        onClick={(evento) => alElegirCelda(habitacion, noche, evento)}
                      />
                    );
                  })}

                  {!enUso && <div className="calendario-mantenimiento">{motivoFueraDeServicio(habitacion)} · no recibe reservas</div>}

                  {barras.map(({ reserva, primera, fin, cortadaIzquierda, cortadaDerecha }) => {
                    const largo = fin - primera;
                    const clases = ['calendario-reserva', `cal-${reserva.estado}`, cortadaIzquierda && 'calendario-corte-izq', cortadaDerecha && 'calendario-corte-der'];
                    return (
                      <button
                        key={reserva._id}
                        type="button"
                        className={clases.filter(Boolean).join(' ')}
                        style={{ gridColumn: `${primera + 2} / ${fin + 2}` }}
                        onClick={(evento) => alElegirReserva(reserva, habitacion, evento)}
                      >
                        <span>{largo > 1 ? reserva.huesped.nombre : primerNombre(reserva.huesped.nombre)}</span>
                        {largo > 2 && (
                          <small>
                            {reserva.codigo} · {reserva.noches} {reserva.noches === 1 ? 'noche' : 'noches'}
                          </small>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Fragment>
            );
          })}

          <div className="calendario-fila">
            <div className="calendario-esquina calendario-pie-esquina">Ocupación</div>
            {ocupacionPorNoche.map(({ fecha, porcentaje }) => (
              <div key={fecha} className="calendario-ocupacion">
                {Math.round(porcentaje)}%
                <i>
                  <span style={{ width: `${porcentaje}%` }} />
                </i>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
