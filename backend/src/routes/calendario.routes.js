import { Router } from 'express';
import * as controlador from '../controllers/calendario.controller.js';
import { requerirAuth } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { calendarioSchema } from '../schemas/calendario.schema.js';

const router = Router();

// El calendario muestra nombres de huéspedes y saldos: exige token.
router.get('/', requerirAuth, validar({ query: calendarioSchema }), controlador.obtener);

export default router;
