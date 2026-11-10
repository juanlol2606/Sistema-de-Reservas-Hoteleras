import { randomUUID } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';
import { falloDeServicioExterno, servicioNoDisponible } from '../utils/errores.js';

const ANCHO_MAXIMO = 1600;
let configurado = false;

function obtenerCliente() {
  if (configurado) return cloudinary;

  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw servicioNoDisponible(
      'El servicio de imágenes no está configurado',
      'Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en el servidor',
    );
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  configurado = true;
  return cloudinary;
}

export async function subirImagenRemota(datos, carpeta) {
  const cliente = obtenerCliente();

  return new Promise((resolver, rechazar) => {
    const flujo = cliente.uploader.upload_stream(
      {
        public_id: `${carpeta}/${randomUUID()}`,
        asset_folder: carpeta,
        resource_type: 'image',
        // f_auto no se admite al subir: el formato automático se pide en la URL de entrega.
        transformation: { width: ANCHO_MAXIMO, crop: 'limit', quality: 'auto' },
      },
      (error, resultado) => {
        if (error) {
          console.error('Cloudinary rechazó la subida:', error.message);
          rechazar(
            falloDeServicioExterno(
              'No se pudo subir la imagen',
              'El servicio de imágenes no respondió; revisa sus credenciales e inténtalo de nuevo',
            ),
          );
          return;
        }
        resolver({ url: resultado.secure_url, publicId: resultado.public_id });
      },
    );
    flujo.end(datos);
  });
}

// Se llama después de borrar el registro: si Cloudinary falla, se avisa en el log y no se deshace nada.
export async function borrarImagenesRemotas(imagenes) {
  if (imagenes.length === 0) return;

  let cliente;
  try {
    cliente = obtenerCliente();
  } catch (error) {
    console.error('Imágenes sin borrar de Cloudinary:', error.message);
    return;
  }

  const resultados = await Promise.allSettled(
    imagenes.map(({ publicId }) => cliente.uploader.destroy(publicId, { invalidate: true })),
  );
  resultados.forEach((resultado, indice) => {
    const motivo = resultado.status === 'rejected' ? resultado.reason?.message : null;
    if (motivo) console.error(`No se pudo borrar ${imagenes[indice].publicId} de Cloudinary:`, motivo);
  });
}
