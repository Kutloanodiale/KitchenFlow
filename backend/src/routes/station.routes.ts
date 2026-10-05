import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get all kitchen stations
router.get('/', async (req, res) => {
  try {
    const stations = await prisma.kitchenStation.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch kitchen stations' });
  }
});

// Get active orders for a station
router.get('/:id/orders', async (req, res) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        stationId: req.params.id,
        status: { notIn: ['READY', 'CANCELLED'] },
      },
      include: {
        order: true,
        menuItem: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(orderItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch station orders' });
  }
});

export default router;
