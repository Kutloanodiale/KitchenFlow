import { Router } from 'express';
import prisma from '../lib/prisma';
import { CreateOrderDto, OrderStatus, OrderItemStatus } from '../types';
import { areAllItemsReady, calculateOrderTotal } from '../lib/utils';

const router = Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
            station: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            menuItem: true,
            station: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const data: CreateOrderDto = req.body;

    // Validate menu items and check availability
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: data.items.map((item) => item.menuItemId) },
      },
      include: {
        recipeItems: {
          include: { ingredient: true },
        },
      },
    });

    // Check if all items exist and are available
    for (const item of data.items) {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      }
      if (!menuItem.available) {
        return res.status(400).json({ error: `Menu item ${menuItem.name} is not available` });
      }
    }

    // Check inventory
    const requiredIngredients = new Map<string, number>();
    for (const item of data.items) {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
      for (const recipe of menuItem.recipeItems) {
        const current = requiredIngredients.get(recipe.ingredientId) || 0;
        requiredIngredients.set(recipe.ingredientId, current + recipe.requiredQuantity * item.quantity);
      }
    }

    // Verify stock availability
    const ingredients = await prisma.ingredient.findMany({
      where: { id: { in: Array.from(requiredIngredients.keys()) } },
    });

    for (const ingredient of ingredients) {
      const required = requiredIngredients.get(ingredient.id) || 0;
      if (ingredient.currentStock < required) {
        return res.status(400).json({
          error: `Insufficient stock for ${ingredient.name}. Required: ${required}, Available: ${ingredient.currentStock}`,
        });
      }
    }

    // Create order with items
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          customerName: data.customerName,
          tableNumber: data.tableNumber,
          status: OrderStatus.CREATED,
        },
      });

      // Create order items
      const orderItems = await Promise.all(
        data.items.map((item) => {
          const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
          return tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              menuItemId: item.menuItemId,
              stationId: menuItem.stationId,
              quantity: item.quantity,
              status: OrderItemStatus.QUEUED,
            },
          });
        })
      );

      // Deduct inventory
      for (const [ingredientId, quantity] of requiredIngredients) {
        await tx.ingredient.update({
          where: { id: ingredientId },
          data: {
            currentStock: {
              decrement: quantity,
            },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            ingredientId,
            quantityChange: -quantity,
            reason: 'ORDER_CONFIRMED',
            referenceId: newOrder.id,
          },
        });
      }

      // Calculate total
      const total = calculateOrderTotal(
        orderItems.map((item) => ({
          menuItem: menuItems.find((m) => m.id === item.menuItemId)!,
          quantity: item.quantity,
        }))
      );

      // Update order with items and total
      const updatedOrder = await tx.order.update({
        where: { id: newOrder.id },
        data: {
          totalAmount: total,
          status: OrderStatus.QUEUED,
          items: {
            connect: { id: orderItems[0].id },
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
              station: true,
            },
          },
        },
      });

      // Record status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: OrderStatus.CREATED,
          toStatus: OrderStatus.QUEUED,
        },
      });

      return updatedOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validate status transition
    if (status === OrderStatus.READY && !areAllItemsReady(order.items)) {
      return res.status(400).json({ error: 'Cannot mark order as READY until all items are READY' });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          items: {
            include: {
              menuItem: true,
              station: true,
            },
          },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: req.params.id,
          fromStatus: order.status,
          toStatus: status,
        },
      });

      return updated;
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update order item status
router.patch('/:orderId/items/:itemId/status', async (req, res) => {
  try {
    const { status } = req.body;

    const orderItem = await prisma.orderItem.update({
      where: { id: req.params.itemId },
      data: { status },
      include: {
        menuItem: true,
        station: true,
      },
    });

    res.json(orderItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order item status' });
  }
});

// Cancel order
router.post('/:id/cancel', async (req, res) => {
  try {
    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: req.params.id },
        data: { status: OrderStatus.CANCELLED },
        include: {
          items: {
            include: {
              menuItem: true,
              station: true,
            },
          },
        },
      });

      // Cancel all active items
      await tx.orderItem.updateMany({
        where: {
          orderId: req.params.id,
          status: { notIn: [OrderItemStatus.READY, OrderItemStatus.CANCELLED] },
        },
        data: { status: OrderItemStatus.CANCELLED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: req.params.id,
          fromStatus: updated.status,
          toStatus: OrderStatus.CANCELLED,
        },
      });

      return updated;
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;
