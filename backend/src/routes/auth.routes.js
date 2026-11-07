import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { validar } from '../middlewares/validate.js';
import { loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/login', validar({ body: loginSchema }), login);

export default router;
