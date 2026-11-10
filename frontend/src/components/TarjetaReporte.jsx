import { useEffect, useRef, useState } from 'react';
import { describirError } from '../api/errores.js';
import { reportes } from '../api/recursos.js';
import AlertaError from './AlertaError.jsx';
import Tarjeta from './Tarjeta.jsx';

// Pide un reporte a la API y pinta lo que devuelva `children(respuesta)`. Maneja carga, error y "sin datos".
// `alCargar` recibe la respuesta (o null mientras se recalcula o si falla): la cabecera de la página la usa para sus cifras.
export default function TarjetaReporte({ reporte, titulo, pregunta, filtros, ancha = false, alCargar, children }) {
  const [estado, setEstado] = useState({ cargando: true, error: null, respuesta: null });
  const alCargarActual = useRef(alCargar);
  alCargarActual.current = alCargar;

  useEffect(() => {
    let vigente = true;
    setEstado((anterior) => ({ ...anterior, cargando: true, error: null }));
    alCargarActual.current?.(null);

    reportes
      .obtener(reporte, filtros)
      .then((respuesta) => {
        if (!vigente) return;
        setEstado({ cargando: false, error: null, respuesta });
        alCargarActual.current?.(respuesta);
      })
      .catch((error) => vigente && setEstado({ cargando: false, error: describirError(error), respuesta: null }));

    return () => {
      vigente = false;
    };
  }, [reporte, filtros]);

  const { cargando, error, respuesta } = estado;

  return (
    <Tarjeta className={`tarjeta-reporte${ancha ? ' tarjeta-reporte-ancha' : ''}`} aria-busy={cargando}>
      <header>
        <h2>{titulo}</h2>
        <p>{pregunta}</p>
      </header>
      <AlertaError error={error} />
      {cargando && !respuesta && <p className="vacio">Calculando…</p>}
      {respuesta && respuesta.data.length === 0 && <p className="vacio">No hay datos para estos filtros.</p>}
      {respuesta && respuesta.data.length > 0 && children(respuesta)}
    </Tarjeta>
  );
}
