import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { describirError } from '../api/errores.js';
import { reservas, resenas } from '../api/recursos.js';
import AlertaError from '../components/AlertaError.jsx';
import ConfirmarAccion from '../components/ConfirmarAccion.jsx';
import { Estrellas } from '../components/Estrellas.jsx';
import FormularioPago from '../components/FormularioPago.jsx';
import FormularioReserva from '../components/FormularioReserva.jsx';
import FormularioResena from '../components/FormularioResena.jsx';
import { InsigniaEstadoReserva } from '../components/Insignia.jsx';
import Modal from '../components/Modal.jsx';
import { useAvisos } from '../context/AvisosContext.jsx';
import { ETIQUETAS_METODO_PAGO, ETIQUETAS_TIPO_HABITACION } from '../utils/catalogos.js';
import { formatearFecha, formatearFechaHora, formatearPesos } from '../utils/formato.js';

// Solo orienta qué botones mostrar; la API es la que valida cada transición.
const ACCIONES_POR_ESTADO = {
  pendiente: [
    { estado: 'confirmada', texto: 'Confirmar reserva' },
    { estado: 'cancelada', texto: 'Cancelar reserva', peligro: true },
  ],
  confirmada: [
    { estado: 'en_curso', texto: 'Registrar llegada (en curso)' },
    { estado: 'cancelada', texto: 'Cancelar reserva', peligro: true },
  ],
  en_curso: [{ estado: 'finalizada', texto: 'Finalizar estadía' }],
  finalizada: [],
  cancelada: [],
};

const ESTADOS_CON_PAGOS = ['pendiente', 'confirmada', 'en_curso'];
const ESTADOS_MODIFICABLES = ['pendiente', 'confirmada'];
const ESTADOS_ELIMINABLES = ['pendiente', 'cancelada'];

export default function ReservaDetalle() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { mostrarAviso } = useAvisos();
  const [estado, setEstado] = useState({ reserva: null, resena: null, cargando: true, error: null });
  const [dialogo, setDialogo] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const reserva = await reservas.obtener(id);
      const resena = reserva.estado === 'finalizada' ? ((await resenas.listar({ reservaId: id })).data[0] ?? null) : null;
      setEstado({ reserva, resena, cargando: false, error: null });
      setErrorAccion(null);
    } catch (error) {
      setEstado((anterior) => ({ ...anterior, cargando: false, error: describirError(error) }));
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const { reserva, resena, cargando, error } = estado;

  if (cargando) return <p className="vacio">Cargando reserva…</p>;
  if (error) {
    return (
      <>
        <Link className="volver" to="/reservas">
          ← Volver a reservas
        </Link>
        <AlertaError error={error} />
      </>
    );
  }

  const cambiarEstado = async (nuevoEstado) => {
    await reservas.cambiarEstado(id, nuevoEstado);
    setDialogo(null);
    mostrarAviso('Estado actualizado');
    await cargar();
  };

  const cambiarEstadoDesdeBoton = async (accion) => {
    if (accion.peligro) return setDialogo({ tipo: 'cancelar' });
    setErrorAccion(null);
    try {
      await cambiarEstado(accion.estado);
    } catch (fallo) {
      setErrorAccion(describirError(fallo));
    }
  };

  const registrarPago = async (pago) => {
    const estadoAnterior = reserva.estado;
    const actualizada = await reservas.registrarPago(id, pago);
    mostrarAviso(actualizada.estado !== estadoAnterior ? 'Pago registrado: la reserva quedó confirmada' : 'Pago registrado');
    await cargar();
  };

  const modificar = async (datos) => {
    await reservas.reemplazar(id, datos);
    setDialogo(null);
    mostrarAviso('Reserva modificada');
    await cargar();
  };

  const eliminar = async () => {
    await reservas.eliminar(id);
    mostrarAviso('Reserva eliminada');
    navegar('/reservas');
  };

  const publicarResena = async (datos) => {
    await resenas.crear({ reservaId: id, ...datos });
    mostrarAviso('Reseña publicada');
    await cargar();
  };

  const eliminarResena = async () => {
    await resenas.eliminar(resena._id);
    setDialogo(null);
    mostrarAviso('Reseña eliminada');
    await cargar();
  };

  const porcentajePagado = reserva.total ? Math.min(100, Math.round((reserva.totalPagado / reserva.total) * 100)) : 0;
  const acciones = ACCIONES_POR_ESTADO[reserva.estado];
  const puedeEliminar = ESTADOS_ELIMINABLES.includes(reserva.estado) && reserva.pagos.length === 0;

  return (
    <>
      <Link className="volver" to="/reservas">
        ← Volver a reservas
      </Link>
      <div className="encabezado-pagina">
        <div>
          <h1>Reserva {reserva.codigo}</h1>
          <p className="descripcion">
            {reserva.hotel?.nombre} · {reserva.hotel?.direccion?.ciudad}
          </p>
        </div>
        <InsigniaEstadoReserva estado={reserva.estado} />
      </div>

      <AlertaError error={errorAccion} />

      <div className="rejilla-detalle">
        <div>
          <section className="panel">
            <h2>Datos de la reserva</h2>
            <dl className="datos">
              <div>
                <dt>Huésped</dt>
                <dd>{reserva.huesped?.nombre}</dd>
                <span className="secundario">{reserva.huesped?.email}</span>
              </div>
              <div>
                <dt>Habitación</dt>
                <dd>
                  {reserva.habitacion.numero} · {ETIQUETAS_TIPO_HABITACION[reserva.habitacion.tipo]}
                </dd>
                <span className="secundario">{formatearPesos(reserva.habitacion.precioNoche)} por noche (precio pactado)</span>
              </div>
              <div>
                <dt>Entrada</dt>
                <dd>{formatearFecha(reserva.fechaEntrada)}</dd>
              </div>
              <div>
                <dt>Salida</dt>
                <dd>{formatearFecha(reserva.fechaSalida)}</dd>
              </div>
              <div>
                <dt>Noches</dt>
                <dd>{reserva.noches}</dd>
              </div>
              <div>
                <dt>Huéspedes</dt>
                <dd>{reserva.numHuespedes}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <h2>Pagos</h2>
            {reserva.pagos.length === 0 ? (
              <p className="descripcion">Todavía no hay pagos registrados.</p>
            ) : (
              <div className="tabla-contenedor">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Método</th>
                      <th className="derecha">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reserva.pagos.map((pago) => (
                      <tr key={`${pago.fecha}-${pago.monto}`}>
                        <td data-etiqueta="Fecha">{formatearFechaHora(pago.fecha)}</td>
                        <td data-etiqueta="Método">{ETIQUETAS_METODO_PAGO[pago.metodo]}</td>
                        <td data-etiqueta="Monto" className="derecha">
                          {formatearPesos(pago.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {ESTADOS_CON_PAGOS.includes(reserva.estado) && reserva.saldo > 0 && (
              <>
                <h3 style={{ margin: '1.2rem 0 0.7rem' }}>Registrar un pago</h3>
                <FormularioPago key={reserva.saldo} saldo={reserva.saldo} alRegistrar={registrarPago} />
              </>
            )}
          </section>

          {reserva.estado === 'finalizada' && (
            <section className="panel">
              <h2>Reseña del huésped</h2>
              {resena ? (
                <div className="resena">
                  <Estrellas cantidad={resena.puntuacion} />
                  <p>{resena.comentario || 'Sin comentario.'}</p>
                  <span className="secundario">Publicada el {formatearFechaHora(resena.fecha)}</span>
                  <div className="acciones">
                    <button type="button" className="boton boton-pequeno boton-enlace peligro" onClick={() => setDialogo({ tipo: 'eliminarResena' })}>
                      Eliminar reseña
                    </button>
                  </div>
                </div>
              ) : (
                <FormularioResena alPublicar={publicarResena} />
              )}
            </section>
          )}
        </div>

        <aside>
          <section className="panel">
            <h2>Resumen económico</h2>
            <dl className="cifras">
              <div>
                <dt>Total</dt>
                <dd>{formatearPesos(reserva.total)}</dd>
              </div>
              <div>
                <dt>Pagado</dt>
                <dd>{formatearPesos(reserva.totalPagado)}</dd>
              </div>
              <div>
                <dt>Saldo</dt>
                <dd>{formatearPesos(reserva.saldo)}</dd>
              </div>
            </dl>
            <div className="barra" role="progressbar" aria-valuenow={porcentajePagado} aria-valuemin={0} aria-valuemax={100} aria-label="Porcentaje pagado">
              <span style={{ width: `${porcentajePagado}%` }} />
            </div>
            <small className="campo-ayuda">{porcentajePagado} % pagado. Con el 30 % la reserva se confirma sola.</small>
          </section>

          <section className="panel">
            <h2>Acciones</h2>
            <div className="acciones-columna">
              {acciones.map((accion) => (
                <button
                  key={accion.estado}
                  type="button"
                  className={`boton ${accion.peligro ? 'boton-peligro' : 'boton-primario'}`}
                  onClick={() => cambiarEstadoDesdeBoton(accion)}
                >
                  {accion.texto}
                </button>
              ))}
              {ESTADOS_MODIFICABLES.includes(reserva.estado) && (
                <button type="button" className="boton" onClick={() => setDialogo({ tipo: 'modificar' })}>
                  Modificar fechas o habitación
                </button>
              )}
              {puedeEliminar && (
                <button type="button" className="boton boton-enlace peligro" onClick={() => setDialogo({ tipo: 'eliminar' })}>
                  Eliminar reserva
                </button>
              )}
              {acciones.length === 0 && !puedeEliminar && !ESTADOS_MODIFICABLES.includes(reserva.estado) && (
                <p className="descripcion">Esta reserva ya no admite cambios.</p>
              )}
            </div>
          </section>
        </aside>
      </div>

      {dialogo?.tipo === 'modificar' && (
        <Modal titulo="Modificar reserva" ancho="ancho" alCerrar={() => setDialogo(null)}>
          <FormularioReserva reserva={reserva} alGuardar={modificar} alCancelar={() => setDialogo(null)} />
        </Modal>
      )}
      {dialogo?.tipo === 'cancelar' && (
        <ConfirmarAccion
          titulo="Cancelar reserva"
          mensaje="Al cancelar, las fechas quedan libres. Los pagos ya registrados se conservan: no hay reembolso automático."
          textoConfirmar="Sí, cancelar reserva"
          peligro
          alConfirmar={() => cambiarEstado('cancelada')}
          alCancelar={() => setDialogo(null)}
        />
      )}
      {dialogo?.tipo === 'eliminar' && (
        <ConfirmarAccion
          titulo="Eliminar reserva"
          mensaje={`¿Eliminar la reserva ${reserva.codigo}? Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          peligro
          alConfirmar={eliminar}
          alCancelar={() => setDialogo(null)}
        />
      )}
      {dialogo?.tipo === 'eliminarResena' && (
        <ConfirmarAccion
          titulo="Eliminar reseña"
          mensaje="¿Eliminar esta reseña? La calificación promedio del hotel se recalculará."
          textoConfirmar="Eliminar"
          peligro
          alConfirmar={eliminarResena}
          alCancelar={() => setDialogo(null)}
        />
      )}
    </>
  );
}
