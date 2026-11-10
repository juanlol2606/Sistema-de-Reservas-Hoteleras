import { ETIQUETAS_ESTADO_RESERVA } from '../utils/catalogos.js';

const PASOS = ['pendiente', 'confirmada', 'en_curso', 'finalizada'];

// Recorrido de una reserva por sus estados. Una reserva cancelada sale del recorrido y no se dibuja.
export default function LineaDeEstado({ estado }) {
  const actual = PASOS.indexOf(estado);
  if (actual === -1) return null;

  return (
    <ol className="linea-estado" aria-label="Estado de la reserva">
      {PASOS.map((paso, indice) => (
        <li key={paso} className={`${indice <= actual ? 'paso-hecho' : ''} ${indice === PASOS.length - 1 ? 'paso-final' : ''}`.trim()}>
          <span className="paso-numero">{indice + 1}</span>
          <span className="paso-texto">{ETIQUETAS_ESTADO_RESERVA[paso]}</span>
          {indice < PASOS.length - 1 && <span className="paso-linea" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}
