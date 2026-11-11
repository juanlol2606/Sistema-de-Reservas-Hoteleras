import { z } from 'zod';
import { TIPOS_HABITACION } from '../models/Habitacion.js';
import { fecha, idMongo } from './comunes.js';

const DIAS_VISIBLES = ['7', '14', '30'];
const DIAS_POR_DEFECTO = 14;

export const calendarioSchema = z.object({
  hotelId: idMongo,
  desde: fecha.optional(),
  dias: z.enum(DIAS_VISIBLES, { error: 'debe ser 7, 14 o 30' }).transform(Number).default(DIAS_POR_DEFECTO),
  tipo: z.enum(TIPOS_HABITACION).optional(),
});
