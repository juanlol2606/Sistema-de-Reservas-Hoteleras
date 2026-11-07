import { Router } from 'express';
import * as controlador from '../controllers/huespedes.controller.js';
import { requerirAuth } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { parametrosId } from '../schemas/comunes.js';
import { filtrosHuespedSchema, huespedParcialSchema, huespedSchema } from '../schemas/huesped.schema.js';

const router = Router();

// Los huéspedes tienen datos personales: incluso la lectura exige token.
router.use(requerirAuth);

router.get('/', validar({ query: filtrosHuespedSchema }), controlador.listar);
router.get('/:id', validar({ params: parametrosId }), controlador.obtener);
router.post('/', validar({ body: huespedSchema }), controlador.crear);
router.put('/:id', validar({ params: parametrosId, body: huespedSchema }), controlador.actualizar);
router.patch('/:id', validar({ params: parametrosId, body: huespedParcialSchema }), controlador.actualizar);
router.delete('/:id', validar({ params: parametrosId }), controlador.eliminar);

export default router;
