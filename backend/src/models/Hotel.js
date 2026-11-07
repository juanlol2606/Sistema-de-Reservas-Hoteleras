import mongoose from 'mongoose';
import { validadorEntero } from '../utils/validadores.js';

const { Schema } = mongoose;

const hotelSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    estrellas: { type: Number, required: true, min: 1, max: 5, validate: validadorEntero },
    activo: { type: Boolean, default: true },
    direccion: {
      calle: { type: String, required: true, trim: true },
      ciudad: { type: String, required: true, trim: true },
      pais: { type: String, required: true, trim: true },
    },
    contacto: {
      telefono: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
    },
    servicios: { type: [String], default: [] },
    calificacionPromedio: { type: Number, default: 0, min: 0, max: 5 },
  },
  { collection: 'hoteles' },
);

hotelSchema.index({ 'direccion.ciudad': 1, estrellas: -1 });

export default mongoose.model('Hotel', hotelSchema);
