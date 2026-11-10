import { z } from 'zod';
import { MAX_IMAGENES } from '../models/imagenes.js';
import { idMongo, requerido } from './comunes.js';

// El publicId trae carpetas ("stayhub/hoteles/abc"): la ruta lo recibe por segmentos y se vuelve a unir.
export const parametrosImagen = z.object({
  id: idMongo,
  publicId: z.array(z.string().min(1)).min(1).transform((segmentos) => segmentos.join('/')),
});

export const ordenImagenesSchema = z.object({
  orden: z
    .array(z.string({ error: requerido }).min(1, 'no puede estar vacío'), { error: requerido })
    .min(1, 'envía al menos un publicId')
    .max(MAX_IMAGENES, `máximo ${MAX_IMAGENES} imágenes`),
});
