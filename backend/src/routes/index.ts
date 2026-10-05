import { Router } from 'express';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import inventoryRoutes from './inventory.routes';
import stationRoutes from './station.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/stations', stationRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
