import Habitacion from '../models/Habitacion.js';
import Hotel from '../models/Hotel.js';
import { MAX_IMAGENES } from '../models/imagenes.js';
import { noEncontrado, solicitudInvalida } from '../utils/errores.js';
import { esImagenPermitida } from '../utils/imagenes.js';
import { borrarImagenesRemotas, subirImagenRemota } from './cloudinary.service.js';
import { obtenerHabitacion } from './habitaciones.service.js';
import { obtenerHotel } from './hoteles.service.js';

const RECURSOS = {
  hoteles: { Modelo: Hotel, carpeta: 'stayhub/hoteles', obtener: obtenerHotel, nombre: 'El hotel' },
  habitaciones: { Modelo: Habitacion, carpeta: 'stayhub/habitaciones', obtener: obtenerHabitacion, nombre: 'La habitación' },
};

function validarArchivos(archivos = [], existentes, nombre) {
  if (archivos.length === 0) {
    throw solicitudInvalida('No se recibió ninguna imagen', 'Envía los archivos en el campo "imagenes" (multipart/form-data)');
  }
  if (existentes + archivos.length > MAX_IMAGENES) {
    throw solicitudInvalida(
      `${nombre} admite máximo ${MAX_IMAGENES} imágenes`,
      `Ya tiene ${existentes} y envías ${archivos.length}`,
    );
  }

  const invalidos = archivos.filter((archivo) => !esImagenPermitida(archivo.buffer));
  if (invalidos.length > 0) {
    throw solicitudInvalida(
      'Solo se aceptan imágenes JPG, PNG o WEBP',
      invalidos.map((archivo) => ({ campo: 'imagenes', mensaje: `"${archivo.originalname.slice(0, 80)}" no es una imagen JPG, PNG o WEBP` })),
    );
  }
}

// Si alguna subida falla, se borran las que ya habían llegado a Cloudinary.
async function subirTodas(archivos, carpeta) {
  const resultados = await Promise.allSettled(archivos.map((archivo) => subirImagenRemota(archivo.buffer, carpeta)));
  const subidas = resultados.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const fallo = resultados.find((r) => r.status === 'rejected');
  if (fallo) {
    await borrarImagenesRemotas(subidas);
    throw fallo.reason;
  }
  return subidas;
}

export async function agregarImagenes(recurso, id, archivos) {
  const { Modelo, carpeta, obtener, nombre } = RECURSOS[recurso];
  const actual = await obtener(id);
  validarArchivos(archivos, actual.imagenes.length, nombre);

  const subidas = await subirTodas(archivos, carpeta);

  // El filtro solo coincide si todavía caben: evita pasar de 6 con peticiones simultáneas.
  const cupo = MAX_IMAGENES - subidas.length;
  const actualizado = await Modelo.findOneAndUpdate(
    { _id: id, [`imagenes.${cupo}`]: { $exists: false } },
    { $push: { imagenes: { $each: subidas } } },
  );
  if (!actualizado) {
    await borrarImagenesRemotas(subidas);
    await obtener(id);
    throw solicitudInvalida(`${nombre} admite máximo ${MAX_IMAGENES} imágenes`, 'Otra petición ocupó el espacio disponible');
  }
  return obtener(id);
}

export async function eliminarImagen(recurso, id, publicId) {
  const { Modelo, obtener } = RECURSOS[recurso];

  const actualizado = await Modelo.findOneAndUpdate(
    { _id: id, 'imagenes.publicId': publicId },
    { $pull: { imagenes: { publicId } } },
  );
  if (!actualizado) {
    await obtener(id);
    throw noEncontrado('La imagen no existe en este registro');
  }
  await borrarImagenesRemotas([{ publicId }]);
  return obtener(id);
}

export async function reordenarImagenes(recurso, id, orden) {
  const registro = await RECURSOS[recurso].obtener(id);
  const porId = new Map(registro.imagenes.map(({ url, publicId }) => [publicId, { url, publicId }]));

  const esMismoConjunto = orden.length === porId.size && new Set(orden).size === orden.length && orden.every((publicId) => porId.has(publicId));
  if (!esMismoConjunto) {
    throw solicitudInvalida(
      'El nuevo orden debe incluir exactamente las imágenes actuales, sin repetir',
      [{ campo: 'orden', mensaje: `debe listar los ${porId.size} publicId actuales` }],
    );
  }

  registro.imagenes = orden.map((publicId) => porId.get(publicId));
  await registro.save();
  return registro;
}
