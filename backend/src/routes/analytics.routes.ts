import { Router } from 'express';
import prisma from '../lib/prisma';
import { isOrderDelayed } from '../lib/utils';

const router = Router();

// Get dashboard analytics
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    const activeOrders = orders.filter((o) =>
      ['CREATED', 'QUEUED', 'PREPARING'].includes(o.status)
    );
    const readyOrders = orders.filter((o) => o.status === 'READY');
    const servedOrders = orders.filter((o) => o.status === 'SERVED');
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

    // Calculate delayed orders
    const delayedOrders = activeOrders.filter((order) =>
      isOrderDelayed(order.items, order.createdAt)
    );

    // Calculate average preparation time for completed orders
    const completedOrders = servedOrders;
    let avgPrepTime = 0;
    if (completedOrders.length > 0) {
      const prepTimes = completedOrders.map((order) => {
        const createdAt = new Date(order.createdAt).getTime();
        const updatedAt = new Date(order.updatedAt).getTime();
        return (updatedAt - createdAt) / 1000 / 60; // in minutes
      });
      avgPrepTime = prepTimes.reduce((sum, time) => sum + time, 0) / prepTimes.length;
    }

    // Calculate revenue for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrders = orders.filter(
      (o) => o.status === 'SERVED' && new Date(o.createdAt) >= startOfMonth
    );
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Popular menu items
    const itemCounts = new Map<string, { name: string; count: number }>();
    for (const order of servedOrders) {
      for (const item of order.items) {
        const current = itemCounts.get(item.menuItemId) || {
          name: item.menuItem.name,
          count: 0,
        };
        itemCounts.set(item.menuItemId, {
          name: item.menuItem.name,
          count: current.count + item.quantity,
        });
      }
    }
    const popularItems = Array.from(itemCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Low stock ingredients
    const lowStockIngredients = await prisma.ingredient.findMany({
      where: {
        currentStock: {
          lte: prisma.ingredient.fields.minStock,
        },
      },
    });

    res.json({
      activeOrders: activeOrders.length,
      readyOrders: readyOrders.length,
      servedOrders: servedOrders.length,
      cancelledOrders: cancelledOrders.length,
      delayedOrders: delayedOrders.length,
      avgPrepTime: Math.round(avgPrepTime * 10) / 10,
      monthlyRevenue,
      popularItems,
      lowStockIngredients,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
