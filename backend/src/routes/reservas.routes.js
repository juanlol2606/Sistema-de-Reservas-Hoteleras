import { Router } from 'express';
import * as facturas from '../controllers/facturas.controller.js';
import * as controlador from '../controllers/reservas.controller.js';
import { requerirAuth } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { parametrosId } from '../schemas/comunes.js';
import { cambiarEstadoSchema, filtrosReservaSchema, pagoSchema, reservaSchema } from '../schemas/reserva.schema.js';

const router = Router();

// Las reservas muestran datos de los huéspedes: toda la ruta exige token.
router.use(requerirAuth);

router.get('/', validar({ query: filtrosReservaSchema }), controlador.listar);
router.get('/:id', validar({ params: parametrosId }), controlador.obtener);
router.post('/', validar({ body: reservaSchema }), controlador.crear);
router.put('/:id', validar({ params: parametrosId, body: reservaSchema }), controlador.actualizar);
router.patch('/:id/estado', validar({ params: parametrosId, body: cambiarEstadoSchema }), controlador.cambiarEstado);
router.post('/:id/pagos', validar({ params: parametrosId, body: pagoSchema }), controlador.registrarPago);
router.get('/:id/factura', validar({ params: parametrosId }), facturas.descargar);
router.delete('/:id', validar({ params: parametrosId }), controlador.eliminar);

export default router;
