import { Router } from 'express';
import * as controlador from '../controllers/hoteles.controller.js';
import { requerirAuth } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { parametrosId } from '../schemas/comunes.js';
import { filtrosHotelSchema, hotelParcialSchema, hotelSchema } from '../schemas/hotel.schema.js';

const router = Router();

router.get('/', validar({ query: filtrosHotelSchema }), controlador.listar);
router.get('/:id', validar({ params: parametrosId }), controlador.obtener);
router.post('/', requerirAuth, validar({ body: hotelSchema }), controlador.crear);
router.put('/:id', requerirAuth, validar({ params: parametrosId, body: hotelSchema }), controlador.actualizar);
router.patch('/:id', requerirAuth, validar({ params: parametrosId, body: hotelParcialSchema }), controlador.actualizar);
router.delete('/:id', requerirAuth, validar({ params: parametrosId }), controlador.eliminar);

export default router;
