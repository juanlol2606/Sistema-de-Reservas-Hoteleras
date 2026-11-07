import { Router } from 'express';
import { consultarSalud } from '../controllers/health.controller.js';

const router = Router();

router.get('/', consultarSalud);

export default router;
