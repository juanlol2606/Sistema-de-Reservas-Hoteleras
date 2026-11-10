import { useEffect, useState } from 'react';
import { describirError } from '../api/errores.js';
import { habitaciones } from '../api/recursos.js';
import { useFormulario } from '../hooks/useFormulario.js';
import { useOpcionesDeHoteles, useOpcionesDeHuespedes } from '../hooks/useOpciones.js';
import { ETIQUETAS_TIPO_HABITACION } from '../utils/catalogos.js';
import { aValorDeFecha, diasEntre, formatearPesos, hoyEnBogota } from '../utils/formato.js';
import { urlDeFoto } from '../utils/imagenes.js';
import { conErrores, entero, requerido } from '../utils/validaciones.js';
import AlertaError from './AlertaError.jsx';
import Campo from './Campo.jsx';
import Formulario from './Formulario.jsx';
import MarcoFoto from './MarcoFoto.jsx';

const VALORES_NUEVOS = { huespedId: '', hotelId: '', habitacionId: '', fechaEntrada: '', fechaSalida: '', numHuespedes: '1' };

const desdeReserva = (r) => ({
  huespedId: r.huespedId,
  hotelId: '',
  habitacionId: r.habitacionId,
  fechaEntrada: aValorDeFecha(r.fechaEntrada),
  fechaSalida: aValorDeFecha(r.fechaSalida),
  numHuespedes: String(r.numHuespedes),
});

// Al modificar, la habitación actual no figura como "disponible" (la ocupa esta misma reserva): se agrega aparte
// con el precio ya pactado.
const habitacionActual = (r) => ({
  _id: r.habitacionId,
  numero: r.habitacion.numero,
  tipo: r.habitacion.tipo,
  precioNoche: r.habitacion.precioNoche,
  hotel: r.hotel,
  imagenes: r.imagenesHabitacion,
  actual: true,
});

export default function FormularioReserva({ reserva, alGuardar, alCancelar }) {
  const opcionesDeHoteles = useOpcionesDeHoteles();
  const opcionesDeHuespedes = useOpcionesDeHuespedes();
  const [opcionesDeHabitaciones, setOpcionesDeHabitaciones] = useState(reserva ? [habitacionActual(reserva)] : []);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);

  const formulario = useFormulario({
    valores: reserva ? desdeReserva(reserva) : VALORES_NUEVOS,
    validar: (v) => validar(v, reserva, opcionesDeHabitaciones),
    alEnviar: (v) =>
      alGuardar({
        huespedId: v.huespedId,
        habitacionId: v.habitacionId,
        fechaEntrada: v.fechaEntrada,
        fechaSalida: v.fechaSalida,
        numHuespedes: Number(v.numHuespedes),
      }),
  });
  const { hotelId, fechaEntrada, fechaSalida, habitacionId } = formulario.valores;

  const fechasCambiaron = !reserva || fechaEntrada !== aValorDeFecha(reserva.fechaEntrada) || fechaSalida !== aValorDeFecha(reserva.fechaSalida);
  const rangoValido = fechaEntrada && fechaSalida && fechaSalida > fechaEntrada;

  useEffect(() => {
    setErrorBusqueda(null);
    if (!rangoValido || (!fechasCambiaron && !hotelId)) {
      setOpcionesDeHabitaciones(reserva ? [habitacionActual(reserva)] : []);
      return undefined;
    }

    let vigente = true;
    setBuscando(true);
    habitaciones
      .disponibles({ entrada: fechaEntrada, salida: fechaSalida, hotelId: hotelId || undefined, limit: 100 })
      .then(({ data }) => {
        if (!vigente) return;
        const actual = reserva && (!hotelId || reserva.hotelId === hotelId) ? [habitacionActual(reserva)] : [];
        const sinRepetir = data.filter((h) => !actual.some((a) => a._id === h._id));
        setOpcionesDeHabitaciones([...actual, ...sinRepetir]);
      })
      .catch((error) => vigente && setErrorBusqueda(describirError(error)))
      .finally(() => vigente && setBuscando(false));

    return () => {
      vigente = false;
    };
  }, [hotelId, fechaEntrada, fechaSalida]);

  useEffect(() => {
    if (habitacionId && !opcionesDeHabitaciones.some((h) => h._id === habitacionId)) formulario.cambiar('habitacionId', '');
  }, [opcionesDeHabitaciones]);

  const elegida = opcionesDeHabitaciones.find((h) => h._id === habitacionId);
  const noches = rangoValido ? diasEntre(fechaEntrada, fechaSalida) : 0;
  const huespedesDisponibles =
    reserva && !opcionesDeHuespedes.some((o) => o.valor === reserva.huespedId)
      ? [{ valor: reserva.huespedId, etiqueta: reserva.huesped.nombre }, ...opcionesDeHuespedes]
      : opcionesDeHuespedes;
  const hayOpciones = opcionesDeHabitaciones.length > 0;

  return (
    <Formulario formulario={formulario} textoEnviar={reserva ? 'Guardar cambios' : 'Crear reserva'} alCancelar={alCancelar}>
      <Campo etiqueta="Fecha de entrada" tipo="date" min={hoyEnBogota()} {...formulario.campo('fechaEntrada')} />
      <Campo etiqueta="Fecha de salida" tipo="date" min={fechaEntrada || hoyEnBogota()} {...formulario.campo('fechaSalida')} />
      <Campo etiqueta="Filtrar por hotel" opciones={opcionesDeHoteles} textoVacio="Todos los hoteles" {...formulario.campo('hotelId')} />
      <Campo etiqueta="Número de huéspedes" tipo="number" min="1" {...formulario.campo('numHuespedes')} />

      <fieldset className="seccion seleccion-habitacion">
        <legend>
          Habitación disponible
          {rangoValido && !buscando && hayOpciones && ` · ${opcionesDeHabitaciones.length} ${opcionesDeHabitaciones.length === 1 ? 'libre' : 'libres'}`}
        </legend>
        {!rangoValido && <p className="campo-ayuda">Elige las fechas para ver las habitaciones libres.</p>}
        {buscando && <p className="campo-ayuda">Buscando habitaciones…</p>}
        <AlertaError error={errorBusqueda} />
        {rangoValido && !buscando && !errorBusqueda && !hayOpciones && <p className="campo-error">No hay habitaciones libres en esas fechas.</p>}
        <div className="opciones-habitacion">
          {opcionesDeHabitaciones.map((h) => (
            <label key={h._id} className={`opcion-habitacion${habitacionId === h._id ? ' opcion-elegida' : ''}`}>
              <MarcoFoto
                relacion="16 / 10"
                icono="cama"
                etiqueta="Foto"
                imagen={h.imagenes?.[0] && urlDeFoto(h.imagenes[0].url, 'opcionHabitacion')}
                alt={`Habitación ${h.numero}`}
              />
              <span className="opcion-cuerpo">
                <span className="opcion-fila">
                  <span className="opcion-titulo">
                    {h.numero} · {ETIQUETAS_TIPO_HABITACION[h.tipo]}
                  </span>
                  <input type="radio" name="habitacionId" checked={habitacionId === h._id} onChange={() => formulario.cambiar('habitacionId', h._id)} />
                </span>
                <span className="opcion-detalle">
                  {h.hotel?.nombre}
                  {h.actual ? ' (actual)' : ''}
                </span>
                <span className="opcion-detalle">
                  {h.capacidad ? `${h.capacidad} ${h.capacidad === 1 ? 'persona' : 'personas'} · ` : ''}
                  {formatearPesos(h.precioNoche)} / noche
                </span>
                {noches > 0 && (
                  <span className="opcion-total">
                    {formatearPesos(noches * h.precioNoche)} por {noches} {noches === 1 ? 'noche' : 'noches'}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
        {formulario.errores.habitacionId && <small className="campo-error">{formulario.errores.habitacionId}</small>}
      </fieldset>

      <Campo etiqueta="Huésped" ancho="completo" opciones={huespedesDisponibles} {...formulario.campo('huespedId')} />

      {elegida && noches > 0 && (
        <div className="campo-completo resumen-reserva">
          <span>
            {noches} {noches === 1 ? 'noche' : 'noches'} · Hab. {elegida.numero} · {elegida.hotel?.nombre}
          </span>
          <strong>{formatearPesos(noches * elegida.precioNoche)}</strong>
        </div>
      )}
    </Formulario>
  );
}

function validar(v, reserva, habitacionesOfrecidas) {
  const elegida = habitacionesOfrecidas.find((h) => h._id === v.habitacionId);
  const errores = {
    huespedId: requerido(v.huespedId),
    fechaEntrada: requerido(v.fechaEntrada),
    fechaSalida: requerido(v.fechaSalida),
    habitacionId: requerido(v.habitacionId) && 'Elige una habitación disponible',
    numHuespedes: entero(v.numHuespedes, 1, 20),
  };

  const fechasCambiaron = !reserva || v.fechaEntrada !== aValorDeFecha(reserva.fechaEntrada) || v.fechaSalida !== aValorDeFecha(reserva.fechaSalida);
  if (!errores.fechaEntrada && !errores.fechaSalida) {
    if (v.fechaSalida <= v.fechaEntrada) errores.fechaSalida = 'Debe ser posterior a la entrada';
    if (fechasCambiaron && v.fechaEntrada < hoyEnBogota()) errores.fechaEntrada = 'No puede ser anterior a hoy';
  }
  if (!errores.numHuespedes && elegida?.capacidad && Number(v.numHuespedes) > elegida.capacidad) {
    errores.numHuespedes = `La habitación admite máximo ${elegida.capacidad}`;
  }
  return conErrores(errores);
}
