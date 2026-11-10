import mongoose from 'mongoose';

export const MAX_IMAGENES = 6;

const imagenSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

// Arreglo embebido de fotos; la primera es la portada.
export const campoImagenes = {
  type: [imagenSchema],
  default: [],
  validate: {
    validator: (imagenes) => imagenes.length <= MAX_IMAGENES,
    message: `admite máximo ${MAX_IMAGENES} imágenes`,
  },
};
