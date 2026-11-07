import mongoose from 'mongoose';
import { config } from './env.js';

const ESTADOS_CONEXION = ['desconectada', 'conectada', 'conectando', 'desconectando'];

export async function conectarBaseDeDatos() {
  await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB conectado: ${mongoose.connection.name}`);
}

export function estadoConexion() {
  return ESTADOS_CONEXION[mongoose.connection.readyState];
}
