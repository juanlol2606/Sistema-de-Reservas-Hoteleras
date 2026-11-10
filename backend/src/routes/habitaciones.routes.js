import { Router } from 'express';
import * as controlador from '../controllers/habitaciones.controller.js';
import { requerirAuth } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { parametrosId } from '../schemas/comunes.js';
import {
  crearHabitacionSchema,
  filtrosDisponiblesSchema,
  filtrosHabitacionSchema,
  modificarHabitacionSchema,
  reemplazarHabitacionSchema,
} from '../schemas/habitacion.schema.js';
import { crearRutasImagenes } from './imagenes.routes.js';

const router = Router();

router.use('/:id/imagenes', crearRutasImagenes('habitaciones'));
router.get('/',validar({ query: filtrosHabitacionSchema }), controlador.listar);
router.get('/disponibles', validar({ query: filtrosDisponiblesSchema }), controlador.disponibles);
router.get('/:id', validar({ params: parametrosId }), controlador.obtener);
router.post('/', requerirAuth, validar({ body: crearHabitacionSchema }), controlador.crear);
router.put(
  '/:id',
  requerirAuth,
  validar({ params: parametrosId, body: reemplazarHabitacionSchema }),
  controlador.actualizar,
);
router.patch(
  '/:id',
  requerirAuth,
  validar({ params: parametrosId, body: modificarHabitacionSchema }),
  controlador.actualizar,
);
router.delete('/:id', requerirAuth, validar({ params: parametrosId }), controlador.eliminar);

export default router;
