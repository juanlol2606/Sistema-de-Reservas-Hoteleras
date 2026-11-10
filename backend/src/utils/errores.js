// Error de negocio con código HTTP; el errorHandler lo convierte en { error, detalle }.
export class ErrorHttp extends Error {
  constructor(status, mensaje, detalle) {
    super(mensaje);
    this.status = status;
    this.detalle = detalle;
  }
}

export const solicitudInvalida = (mensaje, detalle) => new ErrorHttp(400, mensaje, detalle);
export const noAutorizado = (mensaje, detalle) => new ErrorHttp(401, mensaje, detalle);
export const noEncontrado = (mensaje, detalle) => new ErrorHttp(404, mensaje, detalle);
export const conflicto = (mensaje, detalle) => new ErrorHttp(409, mensaje, detalle);
export const falloDeServicioExterno = (mensaje, detalle) => new ErrorHttp(502, mensaje, detalle);
export const servicioNoDisponible = (mensaje, detalle) => new ErrorHttp(503, mensaje, detalle);
