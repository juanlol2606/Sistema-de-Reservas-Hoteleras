import { Router } from 'express';
import { crearControlador } from '../controllers/imagenes.controller.js';
import { requerirAuth } from '../middlewares/auth.js';
import { recibirImagenes } from '../middlewares/recibirImagenes.js';
import { validar } from '../middlewares/validate.js';
import { parametrosId } from '../schemas/comunes.js';
import { ordenImagenesSchema, parametrosImagen } from '../schemas/imagenes.schema.js';

// Rutas de fotos que cuelgan de /hoteles/:id/imagenes y de /habitaciones/:id/imagenes.
export function crearRutasImagenes(recurso) {
  const router = Router({ mergeParams: true });
  const controlador = crearControlador(recurso);

  router.post('/', requerirAuth, validar({ params: parametrosId }), recibirImagenes, controlador.subir);
  router.put('/orden', requerirAuth, validar({ params: parametrosId, body: ordenImagenesSchema }), controlador.reordenar);
  router.delete('/*publicId', requerirAuth, validar({ params: parametrosImagen }), controlador.eliminar);

  return router;
}
