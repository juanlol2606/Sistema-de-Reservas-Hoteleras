import 'dotenv/config';

function leerVariableObligatoria(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Revisa backend/.env`);
  }
  return valor;
}

export const config = {
  puerto: Number(process.env.PORT) || 4000,
  origenesPermitidos: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
  jwtExpiracion: '8h',
  // Opcionales: solo se exigen cuando se sube o se borra una foto.
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  get mongodbUri() {
    return leerVariableObligatoria('MONGODB_URI');
  },
  get jwtSecret() {
    return leerVariableObligatoria('JWT_SECRET');
  },
};

export function validarConfiguracion() {
  leerVariableObligatoria('MONGODB_URI');
  leerVariableObligatoria('JWT_SECRET');
}
