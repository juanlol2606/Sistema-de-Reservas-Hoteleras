import AlertaError from './AlertaError.jsx';

// Mensajes de error, carga y "sin resultados" para los listados que no son tablas.
export default function EstadoListado({ cargando, error, vacio, textoVacio = 'No hay resultados con estos filtros.' }) {
  return (
    <>
      <AlertaError error={error} />
      {!cargando && !error && vacio && <p className="vacio">{textoVacio}</p>}
      {cargando && vacio && <p className="vacio">Cargando…</p>}
    </>
  );
}
