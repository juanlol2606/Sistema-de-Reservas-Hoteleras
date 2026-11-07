// Respuesta uniforme de errores: { error, detalle }.
const MENSAJES_DUPLICADO = {
  'huespedes:email': 'Ya existe un huésped con ese email',
  'huespedes:documento.numero': 'Ya existe un huésped con ese número de documento',
  'habitaciones:hotelId+numero': 'Ya existe una habitación con ese número en este hotel',
  'reservas:codigo': 'El código de reserva ya existe, intenta de nuevo',
  'resenas:reservaId': 'Esa reserva ya tiene una reseña',
  'usuarios:email': 'Ya existe un usuario con ese email',
};

const MENSAJES_VALIDACION = {
  required: 'es obligatorio',
  enum: 'tiene un valor no permitido',
  min: 'es menor que el mínimo permitido',
  max: 'es mayor que el máximo permitido',
  minlength: 'es demasiado corto',
  maxlength: 'es demasiado largo',
};

export function rutaNoEncontrada(req, res) {
  res.status(404).json({
    error: 'Ruta no encontrada',
    detalle: `${req.method} ${req.originalUrl}`,
  });
}

export function manejarErrores(err, req, res, next) {
  const { status, error, detalle } = traducirError(err);
  if (status === 500) console.error(err);
  res.status(status).json({ error, detalle });
}

function traducirError(err) {
  if (err.type === 'entity.parse.failed') {
    return { status: 400, error: 'El cuerpo de la petición no es un JSON válido', detalle: err.message };
  }
  if (err.code === 11000) return traducirDuplicado(err);
  if (err.name === 'ValidationError') {
    const detalle = Object.values(err.errors).map((e) => ({
      campo: e.path,
      mensaje: MENSAJES_VALIDACION[e.kind] ?? e.message,
    }));
    return { status: 400, error: 'Datos inválidos', detalle };
  }
  if (err.name === 'CastError') {
    return { status: 400, error: 'Datos inválidos', detalle: [{ campo: err.path, mensaje: 'tiene un formato inválido' }] };
  }
  if (err.status && err.status < 500) {
    return { status: err.status, error: err.message, detalle: err.detalle };
  }
  return { status: 500, error: 'Error interno del servidor' };
}

// Traduce el E11000 de Mongo (índice único violado) a un 409 con mensaje claro.
function traducirDuplicado(err) {
  const coleccion = /collection: [^.\s]+\.(\S+) index/.exec(err.errmsg ?? '')?.[1];
  const campos = Object.keys(err.keyPattern ?? {});
  return {
    status: 409,
    error: MENSAJES_DUPLICADO[`${coleccion}:${campos.join('+')}`] ?? 'Ya existe un registro con esos datos',
  };
}
