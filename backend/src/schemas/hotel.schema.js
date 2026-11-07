import { z } from 'zod';
import {
  booleanoDeConsulta,
  email,
  entero,
  paginacionDeConsulta,
  parcial,
  requerido,
  telefono,
  texto,
  textoDeConsulta,
} from './comunes.js';

export const hotelSchema = z.object({
  nombre: texto(120),
  estrellas: entero(1, 5),
  activo: z.boolean().optional(),
  direccion: z.object({ calle: texto(150), ciudad: texto(80), pais: texto(80) }, { error: requerido }),
  contacto: z.object({ telefono, email }, { error: requerido }),
  servicios: z.array(texto(60)).optional(),
});

export const hotelParcialSchema = parcial(hotelSchema);

export const filtrosHotelSchema = z.object({
  ...paginacionDeConsulta,
  q: textoDeConsulta.optional(),
  ciudad: textoDeConsulta.optional(),
  estrellas: z.coerce.number().int().min(1).max(5).optional(),
  activo: booleanoDeConsulta.optional(),
});
