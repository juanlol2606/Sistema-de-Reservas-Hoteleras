import mongoose from 'mongoose';

const { Schema } = mongoose;

// Un documento por secuencia: su _id es el nombre (por ejemplo "factura") y `valor` es el último número entregado.
const contadorSchema = new Schema(
  { _id: { type: String }, valor: { type: Number, required: true } },
  { collection: 'contadores', versionKey: false },
);

export default mongoose.model('Contador', contadorSchema);
