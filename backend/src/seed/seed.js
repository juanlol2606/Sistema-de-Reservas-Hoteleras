// Reemplaza el contenido de las 6 colecciones con datos de prueba coherentes. Uso: pnpm seed
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { conectarBaseDeDatos } from '../config/db.js';
import Contador from '../models/Contador.js';
import Hotel from '../models/Hotel.js';
import Habitacion from '../models/Habitacion.js';
import Huesped from '../models/Huesped.js';
import Reserva from '../models/Reserva.js';
import Resena from '../models/Resena.js';
import Usuario from '../models/Usuario.js';
import { generarDatos } from './generador.js';

const MODELOS = [Hotel, Habitacion, Huesped, Reserva, Resena, Usuario];
// Credenciales de demo; al desplegar se pueden reemplazar con ADMIN_EMAIL y ADMIN_PASSWORD.
const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@stayhub.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123!',
};
const RONDAS_BCRYPT = 10;

async function sembrar() {
  await conectarBaseDeDatos();
  console.log(`Base de datos "${mongoose.connection.name}": se borrarán y recrearán las 6 colecciones.`);

  await Promise.all(MODELOS.map((Modelo) => Modelo.deleteMany({})));
  await Promise.all(MODELOS.map((Modelo) => Modelo.syncIndexes()));
  // Las facturas desaparecen con las reservas: el consecutivo vuelve a empezar.
  await Contador.deleteMany({});

  const datos = generarDatos();
  await Hotel.insertMany(datos.hoteles);
  await Habitacion.insertMany(datos.habitaciones);
  await Huesped.insertMany(datos.huespedes);
  await Reserva.insertMany(datos.reservas);
  await Resena.insertMany(datos.resenas);
  await Usuario.create({
    email: ADMIN.email,
    passwordHash: await bcrypt.hash(ADMIN.password, RONDAS_BCRYPT),
    rol: 'admin',
  });

  console.log(
    `Listo: ${datos.hoteles.length} hoteles, ${datos.habitaciones.length} habitaciones, ` +
      `${datos.huespedes.length} huéspedes, ${datos.reservas.length} reservas, ` +
      `${datos.resenas.length} reseñas y 1 usuario admin (${ADMIN.email}).`,
  );
}

sembrar()
  .catch((error) => {
    console.error('El seed falló:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
