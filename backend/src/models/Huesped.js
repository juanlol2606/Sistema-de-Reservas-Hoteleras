import mongoose from 'mongoose';

const { Schema } = mongoose;

export const TIPOS_DOCUMENTO = ['CC', 'CE', 'PA'];

const huespedSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    documento: {
      tipo: { type: String, required: true, enum: TIPOS_DOCUMENTO },
      numero: { type: String, required: true, trim: true },
    },
    telefono: { type: String, required: true, trim: true },
    ciudadOrigen: { type: String, required: true, trim: true },
    fechaRegistro: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true },
  },
  { collection: 'huespedes' },
);

huespedSchema.index({ email: 1 }, { unique: true });
huespedSchema.index({ 'documento.numero': 1 }, { unique: true });
huespedSchema.index({ ciudadOrigen: 1 });

export default mongoose.model('Huesped', huespedSchema);
