import { z } from 'zod';

z.config(z.locales.es());

const requerido = (problema) => (problema.input === undefined ? 'es obligatorio' : undefined);

export const texto = (maximo = 120) =>
  z.string({ error: requerido }).trim().min(1, 'no puede estar vacío').max(maximo, `máximo ${maximo} caracteres`);

export const email = z.string({ error: requerido }).trim().toLowerCase().pipe(z.email('no es un correo válido'));

export const telefono = z
  .string({ error: requerido })
  .trim()
  .regex(/^\+?[\d\s()-]{7,20}$/, 'no es un teléfono válido');

export const entero = (minimo, maximo) =>
  z
    .number({ error: requerido })
    .int('debe ser un número entero')
    .min(minimo, `mínimo ${minimo}`)
    .max(maximo, `máximo ${maximo}`);

const esFechaReal = (texto) => !Number.isNaN(new Date(`${texto}T00:00:00.000Z`).getTime());

// Fecha sin hora (AAAA-MM-DD) convertida a medianoche UTC, igual que se guardan las fechas de reserva.
export const fecha = z
  .string({ error: requerido })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'debe tener el formato AAAA-MM-DD')
  .refine(esFechaReal, 'no es una fecha válida')
  .transform((texto) => new Date(`${texto}T00:00:00.000Z`));

export const idMongo = z.string({ error: requerido }).regex(/^[a-f\d]{24}$/i, 'no es un id válido');

export const parametrosId = z.object({ id: idMongo });

export const booleanoDeConsulta = z
  .enum(['true', 'false'], { error: 'debe ser true o false' })
  .transform((valor) => valor === 'true');

export const paginacionDeConsulta = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
};

export const textoDeConsulta = z.string().trim().min(1);

// PATCH: cualquier subconjunto de campos, pero al menos uno.
export const parcial = (esquema) =>
  esquema.partial().refine((datos) => Object.keys(datos).length > 0, 'Envía al menos un campo para modificar');

export { requerido };
