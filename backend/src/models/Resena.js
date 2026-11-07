import mongoose from 'mongoose';
import { validadorEntero } from '../utils/validadores.js';

const { Schema } = mongoose;

const resenaSchema = new Schema(
  {
    reservaId: { type: Schema.Types.ObjectId, ref: 'Reserva', required: true },
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    huespedId: { type: Schema.Types.ObjectId, ref: 'Huesped', required: true },
    puntuacion: { type: Number, required: true, min: 1, max: 5, validate: validadorEntero },
    comentario: { type: String, trim: true, maxlength: 500 },
    fecha: { type: Date, default: Date.now },
  },
  { collection: 'resenas', id: false, toJSON: { virtuals: true } },
);

resenaSchema.virtual('reserva', { ref: 'Reserva', localField: 'reservaId', foreignField: '_id', justOne: true });
resenaSchema.virtual('hotel', { ref: 'Hotel', localField: 'hotelId', foreignField: '_id', justOne: true });
resenaSchema.virtual('huesped', { ref: 'Huesped', localField: 'huespedId', foreignField: '_id', justOne: true });

resenaSchema.index({ reservaId: 1 }, { unique: true });
resenaSchema.index({ hotelId: 1, fecha: -1 });

export default mongoose.model('Resena', resenaSchema);
