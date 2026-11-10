import { useCallback, useEffect, useState } from 'react';
import { habitaciones, hoteles, huespedes, reservas } from '../api/recursos.js';

// Cifras de la cabecera de cada pantalla: se piden a la API con los listados de siempre (limit=1 solo para leer `total`).
const total = (recurso, params = {}) => recurso.listar({ ...params, limit: 1 }).then((respuesta) => respuesta.total);

async function resumenDeHoteles() {
  const [todos, activos, cuartos] = await Promise.all([hoteles.listar({ limit: 100 }), total(hoteles, { activo: true }), total(habitaciones)]);
  const conReseñas = todos.data.filter((hotel) => hotel.calificacionPromedio > 0);
  const promedio = conReseñas.length ? conReseñas.reduce((suma, hotel) => suma + hotel.calificacionPromedio, 0) / conReseñas.length : null;
  return { total: todos.total, activos, habitaciones: cuartos, promedio };
}

const resumenDeHabitaciones = async () => ({ total: await total(habitaciones) });

async function resumenDeHuespedes() {
  const [todos, activos] = await Promise.all([total(huespedes), total(huespedes, { activo: true })]);
  return { total: todos, activos };
}

async function resumenDeReservas() {
  const [todas, canceladas] = await Promise.all([total(reservas), total(reservas, { estado: 'cancelada' })]);
  return { total: todas, noCanceladas: todas - canceladas };
}

function useResumen(calcular) {
  const [resumen, setResumen] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    calcular()
      .then((datos) => vigente && setResumen(datos))
      .catch(() => vigente && setResumen(null));
    return () => {
      vigente = false;
    };
  }, [calcular, version]);

  return { resumen, recargar: useCallback(() => setVersion((n) => n + 1), []) };
}

export const useResumenDeHoteles = () => useResumen(resumenDeHoteles);
export const useResumenDeHabitaciones = () => useResumen(resumenDeHabitaciones);
export const useResumenDeHuespedes = () => useResumen(resumenDeHuespedes);
export const useResumenDeReservas = () => useResumen(resumenDeReservas);
