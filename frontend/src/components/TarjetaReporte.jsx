import { useEffect, useState } from 'react';
import { describirError } from '../api/errores.js';
import { reportes } from '../api/recursos.js';
import AlertaError from './AlertaError.jsx';

// Pide un reporte a la API y pinta lo que devuelva `children(respuesta)`. Maneja carga, error y "sin datos".
export default function TarjetaReporte({ reporte, titulo, pregunta, filtros, ancha = false, children }) {
  const [estado, setEstado] = useState({ cargando: true, error: null, respuesta: null });

  useEffect(() => {
    let vigente = true;
    setEstado((anterior) => ({ ...anterior, cargando: true, error: null }));

    reportes
      .obtener(reporte, filtros)
      .then((respuesta) => vigente && setEstado({ cargando: false, error: null, respuesta }))
      .catch((error) => vigente && setEstado({ cargando: false, error: describirError(error), respuesta: null }));

    return () => {
      vigente = false;
    };
  }, [reporte, filtros]);

  const { cargando, error, respuesta } = estado;

  return (
    <section className={`tarjeta-reporte ${ancha ? 'tarjeta-reporte-ancha' : ''}`} aria-busy={cargando}>
      <header>
        <h3>{titulo}</h3>
        <p>{pregunta}</p>
      </header>
      <AlertaError error={error} />
      {cargando && !respuesta && <p className="vacio">Calculando…</p>}
      {respuesta && respuesta.data.length === 0 && <p className="vacio">No hay datos para estos filtros.</p>}
      {respuesta && respuesta.data.length > 0 && children(respuesta)}
    </section>
  );
}
