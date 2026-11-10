export const MAX_FOTOS = 6;
export const TAMANO_MAXIMO_MB = 5;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

// Ancho × alto en píxeles según dónde se muestra la foto (el doble de lo que ocupa en pantalla, para que se vea nítida).
const TAMANOS = {
  tarjetaHotel: [800, 500],
  tarjetaHabitacion: [640, 480],
  encabezadoHotel: [208, 144],
  miniaturaReserva: [104, 80],
  opcionHabitacion: [480, 300],
  detalleHabitacion: [840, 630],
  portadaFormulario: [800, 450],
  miniaturaFormulario: [300, 300],
};

// Inserta la transformación en la URL de Cloudinary. Según su documentación, q_auto y f_auto van como
// componentes separados, al final de la URL de entrega.
export function urlDeFoto(url, tamano) {
  const [ancho, alto] = TAMANOS[tamano];
  return url.replace('/upload/', `/upload/c_fill,g_auto,w_${ancho},h_${alto}/q_auto/f_auto/`);
}

// Devuelve el motivo por el que un archivo no sirve, o null si es válido.
export function validarFoto(archivo) {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) return `"${archivo.name}" no es JPG, PNG ni WEBP`;
  if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) return `"${archivo.name}" pesa más de ${TAMANO_MAXIMO_MB} MB`;
  return null;
}
