import { Router } from 'express';
import * as controlador from '../controllers/reportes.controller.js';
import { requerirAuth } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { filtrosReporteSchema } from '../schemas/reporte.schema.js';

const router = Router();

// Los reportes muestran dinero y nombres de huéspedes: toda la ruta exige token.
router.use(requerirAuth, validar({ query: filtrosReporteSchema }));

router.get('/ingresos-por-mes', controlador.ingresosPorMes);
router.get('/reservas-por-ciudad', controlador.reservasPorCiudad);
router.get('/top-hoteles', controlador.topHoteles);
router.get('/tipos-habitacion', controlador.tiposHabitacion);
router.get('/cancelaciones', controlador.cancelaciones);
router.get('/top-huespedes', controlador.topHuespedes);
router.get('/pagos-por-metodo', controlador.pagosPorMetodo);
router.get('/ocupacion', controlador.ocupacion);

export default router;
