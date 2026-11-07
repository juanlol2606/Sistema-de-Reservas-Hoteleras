import { z } from 'zod';
import { ESTADOS_HABITACION, TIPOS_HABITACION } from '../models/Habitacion.js';
import {
  booleanoDeConsulta,
  entero,
  fecha,
  idMongo,
  paginacionDeConsulta,
  parcial,
  requerido,
  texto,
  textoDeConsulta,
} from './comunes.js';

const camposHabitacion = {
  numero: texto(10),
  tipo: z.enum(TIPOS_HABITACION, { error: requerido }),
  capacidad: entero(1, 12),
  precioNoche: z.number({ error: requerido }).positive('debe ser mayor que 0'),
  estado: z.enum(ESTADOS_HABITACION).optional(),
  activo: z.boolean().optional(),
  amenidades: z.array(texto(60)).optional(),
};

export const crearHabitacionSchema = z.object({ hotelId: idMongo, ...camposHabitacion });

// El hotel de una habitación no se cambia: las reservas existentes dependen de él.
export const reemplazarHabitacionSchema = z.object(camposHabitacion);

export const modificarHabitacionSchema = parcial(reemplazarHabitacionSchema);

export const filtrosDisponiblesSchema = z
  .object({
    ...paginacionDeConsulta,
    hotelId: idMongo.optional(),
    tipo: z.enum(TIPOS_HABITACION).optional(),
    entrada: fecha.optional(),
    salida: fecha.optional(),
    precioMin: z.coerce.number().min(0).optional(),
    precioMax: z.coerce.number().min(0).optional(),
  })
  .refine((filtros) => (filtros.entrada === undefined) === (filtros.salida === undefined), {
    message: 'envía entrada y salida juntas',
    path: ['salida'],
  })
  .refine((filtros) => filtros.precioMin === undefined || filtros.precioMax === undefined || filtros.precioMin <= filtros.precioMax, {
    message: 'precioMin no puede ser mayor que precioMax',
    path: ['precioMin'],
  });

export const filtrosHabitacionSchema = z.object({
  ...paginacionDeConsulta,
  q: textoDeConsulta.optional(),
  hotelId: idMongo.optional(),
  tipo: z.enum(TIPOS_HABITACION).optional(),
  estado: z.enum(ESTADOS_HABITACION).optional(),
  activo: booleanoDeConsulta.optional(),
});
