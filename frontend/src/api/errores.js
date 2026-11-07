// Convierte un error de Axios en algo mostrable: título, texto de apoyo, lista por campo y mapa campo -> mensaje.
export function describirError(error) {
  if (!error.response) {
    return {
      mensaje: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      detalle: null,
      detalles: [],
      campos: {},
    };
  }

  const { status, data } = error.response;
  const detalles = Array.isArray(data?.detalle) ? data.detalle : [];
  return {
    estado: status,
    mensaje: data?.error ?? 'Ocurrió un error inesperado',
    detalle: typeof data?.detalle === 'string' ? data.detalle : null,
    detalles,
    campos: Object.fromEntries(detalles.map(({ campo, mensaje }) => [campo, mensaje])),
  };
}
