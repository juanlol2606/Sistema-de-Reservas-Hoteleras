import multer from 'multer';
import { MAX_IMAGENES } from '../models/imagenes.js';
import { solicitudInvalida } from '../utils/errores.js';

const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

const MENSAJES = {
  LIMIT_FILE_SIZE: 'Cada imagen debe pesar máximo 5 MB',
  LIMIT_FILE_COUNT: `Envía máximo ${MAX_IMAGENES} imágenes por petición`,
  LIMIT_UNEXPECTED_FILE: `Envía hasta ${MAX_IMAGENES} imágenes en el campo "imagenes"`,
};

const recibir = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAXIMO_BYTES, files: MAX_IMAGENES },
}).array('imagenes', MAX_IMAGENES);

// Lee el multipart en memoria (no toca el disco) y traduce los errores de multer a 400.
export function recibirImagenes(req, res, next) {
  recibir(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      next(solicitudInvalida(MENSAJES[error.code] ?? 'No se pudo leer el archivo enviado', error.message));
      return;
    }
    next(error);
  });
}
