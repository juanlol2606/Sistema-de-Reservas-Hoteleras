import * as reportes from '../services/reportes.service.js';

const responderCon = (reporte) => async (req, res) => {
  res.json(await reporte(req.validado.query));
};

export const ingresosPorMes = responderCon(reportes.ingresosPorMes);
export const reservasPorCiudad = responderCon(reportes.reservasPorCiudad);
export const topHoteles = responderCon(reportes.topHoteles);
export const tiposHabitacion = responderCon(reportes.tiposHabitacion);
export const cancelaciones = responderCon(reportes.cancelaciones);
export const topHuespedes = responderCon(reportes.topHuespedes);
export const pagosPorMetodo = responderCon(reportes.pagosPorMetodo);
export const ocupacion = responderCon(reportes.ocupacion);
