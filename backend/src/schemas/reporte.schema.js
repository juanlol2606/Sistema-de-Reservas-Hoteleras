import { z } from 'zod';
import { fecha, textoDeConsulta } from './comunes.js';

export const filtrosReporteSchema = z
  .object({
    desde: fecha.optional(),
    hasta: fecha.optional(),
    ciudad: textoDeConsulta.optional(),
  })
  .refine((filtros) => !filtros.desde || !filtros.hasta || filtros.desde <= filtros.hasta, {
    message: 'desde no puede ser posterior a hasta',
    path: ['desde'],
  });
