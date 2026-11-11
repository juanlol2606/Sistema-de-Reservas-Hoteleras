import Contador from '../models/Contador.js';
import Hotel from '../models/Hotel.js';
import Huesped from '../models/Huesped.js';
import Reserva from '../models/Reserva.js';
import { generarPdfFactura } from '../pdf/factura.pdf.js';
import { conflicto, noEncontrado } from '../utils/errores.js';
import { enExclusion } from '../utils/exclusion.js';
import { etiquetaEstado } from '../utils/formatoFactura.js';

const SECUENCIA_FACTURA = 'factura';
const DIGITOS_NUMERO = 6;

// El $inc es atómico: dos peticiones simultáneas nunca reciben el mismo número.
async function siguienteNumero() {
  const { valor } = await Contador.findOneAndUpdate(
    { _id: SECUENCIA_FACTURA },
    { $inc: { valor: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return `FAC-${String(valor).padStart(DIGITOS_NUMERO, '0')}`;
}

const copiarEmisor = ({ nombre, direccion, contacto }) => ({
  nombre,
  direccion: { calle: direccion.calle, ciudad: direccion.ciudad, pais: direccion.pais },
  contacto: { telefono: contacto.telefono, email: contacto.email },
});

const copiarCliente = ({ nombre, documento, ciudadOrigen, telefono, email }) => ({
  nombre,
  documento: { tipo: documento.tipo, numero: documento.numero },
  ciudadOrigen,
  telefono,
  email,
});

async function emitirFactura(reserva) {
  const [hotel, huesped] = await Promise.all([Hotel.findById(reserva.hotelId), Huesped.findById(reserva.huespedId)]);
  if (!hotel) throw noEncontrado('Hotel no encontrado');
  if (!huesped) throw noEncontrado('Huésped no encontrado');

  const factura = {
    numero: await siguienteNumero(),
    fechaEmision: new Date(),
    emisor: copiarEmisor(hotel),
    cliente: copiarCliente(huesped),
  };

  // La condición "aún sin factura" va en el propio update: si otra instancia emitió primero, gana la suya.
  const emision = await Reserva.updateOne({ _id: reserva._id, factura: { $exists: false } }, { $set: { factura } });
  if (emision.modifiedCount === 1) return factura;
  return (await Reserva.findById(reserva._id)).factura;
}

// Devuelve la factura de la reserva y, si es la primera vez, la emite. La cola por reserva evita que dos clics seguidos
// gasten dos números dentro de este proceso.
function obtenerOEmitir(id) {
  return enExclusion(`factura:${id}`, async () => {
    const reserva = await Reserva.findById(id);
    if (!reserva) throw noEncontrado('Reserva no encontrada');
    if (reserva.estado !== 'finalizada') {
      throw conflicto(
        `No se puede facturar una reserva ${etiquetaEstado(reserva.estado).toLowerCase()}`,
        'La factura se genera cuando la reserva está finalizada',
      );
    }
    return { reserva, factura: reserva.factura ?? (await emitirFactura(reserva)) };
  });
}

export async function generarFactura(id) {
  const datos = await obtenerOEmitir(id);
  return { numero: datos.factura.numero, pdf: await generarPdfFactura(datos) };
}
