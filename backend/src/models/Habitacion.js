import mongoose from 'mongoose';
import { validadorEntero } from '../utils/validadores.js';

const { Schema } = mongoose;

export const TIPOS_HABITACION = ['sencilla', 'doble', 'suite'];
export const ESTADOS_HABITACION = ['disponible', 'mantenimiento'];

const habitacionSchema = new Schema(
  {
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    numero: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, enum: TIPOS_HABITACION },
    capacidad: { type: Number, required: true, min: 1, validate: validadorEntero },
    precioNoche: { type: Number, required: true, min: 0 },
    estado: { type: String, enum: ESTADOS_HABITACION, default: 'disponible' },
    activo: { type: Boolean, default: true },
    amenidades: { type: [String], default: [] },
  },
  { collection: 'habitaciones', id: false, toJSON: { virtuals: true } },
);

// `hotel` trae el nombre legible cuando se hace populate; `hotelId` sigue siendo el id.
habitacionSchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'hotelId',
  foreignField: '_id',
  justOne: true,
});

habitacionSchema.index({ hotelId: 1, numero: 1 }, { unique: true });
habitacionSchema.index({ hotelId: 1, tipo: 1, precioNoche: 1 });

export default mongoose.model('Habitacion', habitacionSchema);
