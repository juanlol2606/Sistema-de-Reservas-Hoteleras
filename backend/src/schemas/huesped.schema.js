import { z } from 'zod';
import { TIPOS_DOCUMENTO } from '../models/Huesped.js';
import {
  booleanoDeConsulta,
  email,
  paginacionDeConsulta,
  parcial,
  requerido,
  telefono,
  texto,
  textoDeConsulta,
} from './comunes.js';

export const huespedSchema = z.object({
  nombre: texto(120),
  email,
  documento: z.object(
    {
      tipo: z.enum(TIPOS_DOCUMENTO, { error: requerido }),
      numero: z
        .string({ error: requerido })
        .trim()
        .toUpperCase()
        .regex(/^[A-Z0-9]{4,20}$/, 'debe tener entre 4 y 20 letras o números'),
    },
    { error: requerido },
  ),
  telefono,
  ciudadOrigen: texto(80),
  activo: z.boolean().optional(),
});

export const huespedParcialSchema = parcial(huespedSchema);

export const filtrosHuespedSchema = z.object({
  ...paginacionDeConsulta,
  q: textoDeConsulta.optional(),
  ciudad: textoDeConsulta.optional(),
  activo: booleanoDeConsulta.optional(),
});
