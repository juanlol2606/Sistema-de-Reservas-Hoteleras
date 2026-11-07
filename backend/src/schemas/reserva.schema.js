import { z } from 'zod';
import { ESTADOS_RESERVA, METODOS_PAGO } from '../models/Reserva.js';
import { entero, fecha, idMongo, paginacionDeConsulta, requerido, textoDeConsulta } from './comunes.js';

// Los mismos campos sirven para crear y para modificar; el hotel se deduce de la habitación.
export const reservaSchema = z.object({
  huespedId: idMongo,
  habitacionId: idMongo,
  fechaEntrada: fecha,
  fechaSalida: fecha,
  numHuespedes: entero(1, 20),
});

export const cambiarEstadoSchema = z.object({
  estado: z.enum(ESTADOS_RESERVA, { error: requerido }),
});

export const pagoSchema = z.object({
  monto: entero(1, 1_000_000_000),
  metodo: z.enum(METODOS_PAGO, { error: requerido }),
});

export const filtrosReservaSchema = z
  .object({
    ...paginacionDeConsulta,
    estado: z.enum(ESTADOS_RESERVA).optional(),
    hotelId: idMongo.optional(),
    desde: fecha.optional(),
    hasta: fecha.optional(),
    huesped: textoDeConsulta.optional(),
  })
  .refine((filtros) => !filtros.desde || !filtros.hasta || filtros.desde <= filtros.hasta, {
    message: 'desde no puede ser posterior a hasta',
    path: ['desde'],
  });
