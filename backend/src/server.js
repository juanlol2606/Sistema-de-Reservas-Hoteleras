import app from './app.js';
import { config, validarConfiguracion } from './config/env.js';
import { conectarBaseDeDatos } from './config/db.js';

async function iniciarServidor() {
  validarConfiguracion();
  await conectarBaseDeDatos();
  app.listen(config.puerto, () => {
    console.log(`API de StayHub escuchando en el puerto ${config.puerto}`);
  });
}

iniciarServidor().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
});
