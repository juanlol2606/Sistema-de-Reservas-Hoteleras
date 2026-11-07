import mongoose from 'mongoose';

const { Schema } = mongoose;

export const ROLES_USUARIO = ['admin', 'recepcionista'];

const usuarioSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    // No se devuelve en las consultas; el login lo pide con .select('+passwordHash').
    passwordHash: { type: String, required: true, select: false },
    rol: { type: String, enum: ROLES_USUARIO, default: 'recepcionista' },
  },
  { collection: 'usuarios' },
);

usuarioSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('Usuario', usuarioSchema);
