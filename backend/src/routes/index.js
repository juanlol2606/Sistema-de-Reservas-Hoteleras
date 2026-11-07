import { Router } from 'express';
import authRoutes from './auth.routes.js';
import habitacionesRoutes from './habitaciones.routes.js';
import healthRoutes from './health.routes.js';
import hotelesRoutes from './hoteles.routes.js';
import huespedesRoutes from './huespedes.routes.js';
import reservasRoutes from './reservas.routes.js';
import reportesRoutes from './reportes.routes.js';
import resenasRoutes from './resenas.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/hoteles', hotelesRoutes);
router.use('/habitaciones', habitacionesRoutes);
router.use('/huespedes', huespedesRoutes);
router.use('/reservas', reservasRoutes);
router.use('/resenas', resenasRoutes);
router.use('/reportes', reportesRoutes);

export default router;
