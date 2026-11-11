import mongoose from 'mongoose';
import { validadorEntero } from '../utils/validadores.js';
import { TIPOS_HABITACION } from './Habitacion.js';

const { Schema } = mongoose;

export const ESTADOS_RESERVA = ['pendiente', 'confirmada', 'en_curso', 'finalizada', 'cancelada'];
export const ESTADOS_ACTIVOS = ['pendiente', 'confirmada', 'en_curso'];
export const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia', 'pse'];

const pagoSchema = new Schema(
  {
    monto: { type: Number, required: true, min: 1 },
    metodo: { type: String, required: true, enum: METODOS_PAGO },
    fecha: { type: Date, default: Date.now },
  },
  { _id: false },
);

// Copia de los datos del hotel y del huésped al emitir: la factura reimpresa sale idéntica aunque ellos cambien después.
const facturaSchema = new Schema(
  {
    numero: { type: String, required: true },
    fechaEmision: { type: Date, required: true },
    emisor: {
      nombre: { type: String, required: true },
      direccion: {
        calle: { type: String, required: true },
        ciudad: { type: String, required: true },
        pais: { type: String, required: true },
      },
      contacto: {
        telefono: { type: String, required: true },
        email: { type: String, required: true },
      },
    },
    cliente: {
      nombre: { type: String, required: true },
      documento: {
        tipo: { type: String, required: true },
        numero: { type: String, required: true },
      },
      ciudadOrigen: { type: String, required: true },
      telefono: { type: String, required: true },
      email: { type: String, required: true },
    },
  },
  { _id: false },
);

const reservaSchema = new Schema(
  {
    codigo: { type: String, required: true, trim: true },
    huespedId: { type: Schema.Types.ObjectId, ref: 'Huesped', required: true },
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    habitacionId: { type: Schema.Types.ObjectId, ref: 'Habitacion', required: true },
    fechaEntrada: { type: Date, required: true },
    fechaSalida: { type: Date, required: true },
    noches: { type: Number, required: true, min: 1, validate: validadorEntero },
    numHuespedes: { type: Number, required: true, min: 1, validate: validadorEntero },
    estado: { type: String, enum: ESTADOS_RESERVA, default: 'pendiente' },
    // Copia de la habitación al reservar: congela el precio pactado aunque la tarifa cambie después.
    habitacion: {
      numero: { type: String, required: true },
      tipo: { type: String, required: true, enum: TIPOS_HABITACION },
      precioNoche: { type: Number, required: true, min: 0 },
    },
    pagos: { type: [pagoSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    factura: { type: facturaSchema },
  },
  { collection: 'reservas', id: false, toJSON: { virtuals: true } },
);

// `huesped` y `hotel` traen los nombres legibles al hacer populate; la habitación ya viene embebida.
reservaSchema.virtual('huesped', { ref: 'Huesped', localField: 'huespedId', foreignField: '_id', justOne: true });
reservaSchema.virtual('hotel', { ref: 'Hotel', localField: 'hotelId', foreignField: '_id', justOne: true });

// Devuelven undefined si la consulta no trajo `pagos` o `total` (por ejemplo, un populate con select parcial).
reservaSchema.virtual('totalPagado').get(function totalPagado() {
  return this.pagos?.reduce((suma, pago) => suma + pago.monto, 0);
});
reservaSchema.virtual('saldo').get(function saldo() {
  if (this.total === undefined || this.totalPagado === undefined) return undefined;
  return this.total - this.totalPagado;
});

reservaSchema.index({ codigo: 1 }, { unique: true });
// Respaldo del consecutivo: dos reservas nunca comparten número de factura (las que no tienen factura no cuentan).
reservaSchema.index({ 'factura.numero': 1 }, { unique: true, partialFilterExpression: { 'factura.numero': { $type: 'string' } } });
// Detecta traslapes (regla 1): reservas de una habitación dentro de un rango de fechas.
reservaSchema.index({ habitacionId: 1, fechaEntrada: 1, fechaSalida: 1 });
reservaSchema.index({ hotelId: 1, estado: 1, fechaEntrada: -1 });
reservaSchema.index({ huespedId: 1, estado: 1 });

export default mongoose.model('Reserva', reservaSchema);
