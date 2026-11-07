import { z } from 'zod';
import { email, requerido } from './comunes.js';

export const loginSchema = z.object({
  email,
  password: z.string({ error: requerido }).min(1, 'no puede estar vacío'),
});
