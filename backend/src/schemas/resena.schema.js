import { z } from 'zod';
import { entero, idMongo, paginacionDeConsulta, texto } from './comunes.js';

export const crearResenaSchema = z.object({
  reservaId: idMongo,
  puntuacion: entero(1, 5),
  comentario: texto(500).optional(),
});

export const filtrosResenaSchema = z.object({
  ...paginacionDeConsulta,
  hotelId: idMongo.optional(),
  huespedId: idMongo.optional(),
  reservaId: idMongo.optional(),
});
