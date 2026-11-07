const opciones = (etiquetas) => Object.entries(etiquetas).map(([valor, etiqueta]) => ({ valor, etiqueta }));

export const ETIQUETAS_ESTADO_RESERVA = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  en_curso: 'En curso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

export const TONOS_ESTADO_RESERVA = {
  pendiente: 'aviso',
  confirmada: 'info',
  en_curso: 'primario',
  finalizada: 'exito',
  cancelada: 'peligro',
};

export const ETIQUETAS_TIPO_HABITACION = { sencilla: 'Sencilla', doble: 'Doble', suite: 'Suite' };
export const ETIQUETAS_ESTADO_HABITACION = { disponible: 'Disponible', mantenimiento: 'Mantenimiento' };
export const ETIQUETAS_METODO_PAGO = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', pse: 'PSE' };
export const ETIQUETAS_TIPO_DOCUMENTO = { CC: 'Cédula (CC)', CE: 'Cédula de extranjería (CE)', PA: 'Pasaporte (PA)' };

export const OPCIONES_ESTADO_RESERVA = opciones(ETIQUETAS_ESTADO_RESERVA);
export const OPCIONES_TIPO_HABITACION = opciones(ETIQUETAS_TIPO_HABITACION);
export const OPCIONES_ESTADO_HABITACION = opciones(ETIQUETAS_ESTADO_HABITACION);
export const OPCIONES_METODO_PAGO = opciones(ETIQUETAS_METODO_PAGO);
export const OPCIONES_TIPO_DOCUMENTO = opciones(ETIQUETAS_TIPO_DOCUMENTO);
export const OPCIONES_ESTRELLAS = [1, 2, 3, 4, 5].map((n) => ({ valor: String(n), etiqueta: '★'.repeat(n) }));
export const OPCIONES_ACTIVO = [
  { valor: 'true', etiqueta: 'Activos' },
  { valor: 'false', etiqueta: 'Inactivos' },
];
