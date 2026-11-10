import { ETIQUETAS_ESTADO_RESERVA, TONOS_ESTADO_RESERVA } from '../utils/catalogos.js';

export default function Insignia({ tono = 'neutro', children }) {
  return (
    <span className={`insignia insignia-${tono}`}>
      <span className="insignia-punto" aria-hidden="true" />
      {children}
    </span>
  );
}

export const InsigniaEstadoReserva = ({ estado }) => (
  <Insignia tono={TONOS_ESTADO_RESERVA[estado]}>{ETIQUETAS_ESTADO_RESERVA[estado]}</Insignia>
);

export const InsigniaActivo = ({ activo }) => (
  <Insignia tono={activo ? 'exito' : 'neutro'}>{activo ? 'Activo' : 'Inactivo'}</Insignia>
);
