import { Router } from 'express';
import * as controlador from '../controllers/resenas.controller.js';
import { requerirAuth } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { parametrosId } from '../schemas/comunes.js';
import { crearResenaSchema, filtrosResenaSchema } from '../schemas/resena.schema.js';

const router = Router();

router.get('/', validar({ query: filtrosResenaSchema }), controlador.listar);
router.get('/:id', validar({ params: parametrosId }), controlador.obtener);
router.post('/', requerirAuth, validar({ body: crearResenaSchema }), controlador.crear);
router.delete('/:id', requerirAuth, validar({ params: parametrosId }), controlador.eliminar);

export default router;
