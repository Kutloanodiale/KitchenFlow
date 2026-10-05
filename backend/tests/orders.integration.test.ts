import request from 'supertest';
import app from '../src/server';
import { prisma } from './setup';

describe('Order API Integration Tests', () => {
  let categoryId: string;
  let stationId: string;
  let menuItemId: string;
  let ingredientId: string;

  beforeEach(async () => {
    // Clean up before each test
    await prisma.orderStatusHistory.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.inventoryMovement.deleteMany();
    await prisma.recipeItem.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.kitchenStation.deleteMany();
    await prisma.category.deleteMany();

    // Create test data
    const category = await prisma.category.create({
      data: { name: 'Test Category' },
    });
    categoryId = category.id;

    const station = await prisma.kitchenStation.create({
      data: { name: 'TEST_STATION' },
    });
    stationId = station.id;

    const menuItem = await prisma.menuItem.create({
      data: {
        name: 'Test Burger',
        description: 'A test burger',
        price: 10.99,
        estimatedTime: 15,
        categoryId: categoryId,
        stationId: stationId,
        available: true,
      },
    });
    menuItemId = menuItem.id;

    const ingredient = await prisma.ingredient.create({
      data: {
        name: 'Beef Patty',
        unit: 'pieces',
        currentStock: 100,
        minStock: 20,
      },
    });
    ingredientId = ingredient.id;

    // Create recipe
    await prisma.recipeItem.create({
      data: {
        menuItemId: menuItemId,
        ingredientId: ingredientId,
        requiredQuantity: 1,
      },
    });
  });

  describe('POST /api/orders - Order Creation and Persistence', () => {
    it('should create an order and persist it to database', async () => {
      const orderData = {
        customerName: 'John Doe',
        tableNumber: '5',
        items: [
          { menuItemId: menuItemId, quantity: 2 },
        ],
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.customerName).toBe('John Doe');
      expect(response.body.tableNumber).toBe('5');
      expect(response.body.status).toBe('QUEUED');
      expect(response.body.totalAmount).toBe(21.98);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].quantity).toBe(2);

      // Verify persistence by fetching from database
      const persistedOrder = await prisma.order.findUnique({
        where: { id: response.body.id },
        include: { items: true },
      });

      expect(persistedOrder).not.toBeNull();
      expect(persistedOrder!.customerName).toBe('John Doe');
      expect(persistedOrder!.items).toHaveLength(1);
    });

    it('should create order with multiple items', async () => {
      // Create another menu item
      const menuItem2 = await prisma.menuItem.create({
        data: {
          name: 'Test Fries',
          description: 'A test fries',
          price: 4.99,
          estimatedTime: 8,
          categoryId: categoryId,
          stationId: stationId,
          available: true,
        },
      });

      const orderData = {
        customerName: 'Jane Smith',
        items: [
          { menuItemId: menuItemId, quantity: 1 },
          { menuItemId: menuItem2.id, quantity: 2 },
        ],
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.totalAmount).toBe(15.97); // 10.99 + (4.99 * 2)
    });

    it('should create order without customer name and table number', async () => {
      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 1 },
        ],
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.customerName).toBeNull();
      expect(response.body.tableNumber).toBeNull();
    });
  });

  describe('Inventory Deduction', () => {
    it('should deduct inventory when order is created', async () => {
      // Check initial stock
      const initialIngredient = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });
      const initialStock = initialIngredient!.currentStock;

      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 3 },
        ],
      };

      await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      // Verify stock was deducted
      const updatedIngredient = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });

      expect(updatedIngredient!.currentStock).toBe(initialStock - 3);

      // Verify inventory movement was recorded
      const movements = await prisma.inventoryMovement.findMany({
        where: { ingredientId: ingredientId },
      });

      expect(movements).toHaveLength(1);
      expect(movements[0].quantityChange).toBe(-3);
      expect(movements[0].reason).toBe('ORDER_CONFIRMED');
    });

    it('should create inventory movement records for audit trail', async () => {
      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 2 },
        ],
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const movements = await prisma.inventoryMovement.findMany({
        where: { ingredientId: ingredientId },
      });

      expect(movements).toHaveLength(1);
      expect(movements[0].referenceId).toBe(response.body.id);
      expect(movements[0].reason).toBe('ORDER_CONFIRMED');
    });
  });

  describe('Insufficient Stock Prevention', () => {
    it('should prevent order creation when stock is insufficient', async () => {
      // Set stock to low value
      await prisma.ingredient.update({
        where: { id: ingredientId },
        data: { currentStock: 2 },
      });

      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 5 }, // Requires 5, only 2 available
        ],
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('Insufficient stock');
      expect(response.body.error).toContain('Beef Patty');

      // Verify no order was created
      const orders = await prisma.order.findMany();
      expect(orders).toHaveLength(0);

      // Verify stock was not changed
      const ingredient = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });
      expect(ingredient!.currentStock).toBe(2);
    });

    it('should not create inventory movements when order fails', async () => {
      await prisma.ingredient.update({
        where: { id: ingredientId },
        data: { currentStock: 1 },
      });

      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 3 },
        ],
      };

      await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      const movements = await prisma.inventoryMovement.findMany();
      expect(movements).toHaveLength(0);
    });
  });

  describe('Order Cancellation and History Retention', () => {
    it('should cancel order and retain it in database', async () => {
      // Create an order first
      const orderData = {
        customerName: 'Test Customer',
        items: [
          { menuItemId: menuItemId, quantity: 1 },
        ],
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.id;

      // Cancel the order
      const cancelResponse = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .expect(200);

      expect(cancelResponse.body.status).toBe('CANCELLED');

      // Verify order still exists in database
      const cancelledOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });

      expect(cancelledOrder).not.toBeNull();
      expect(cancelledOrder!.status).toBe('CANCELLED');
      expect(cancelledOrder!.customerName).toBe('Test Customer');
    });

    it('should record status history when cancelling', async () => {
      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 1 },
        ],
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.id;

      await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .expect(200);

      // Verify status history
      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId: orderId },
        orderBy: { changedAt: 'asc' },
      });

      expect(history.length).toBeGreaterThanOrEqual(2);
      // First transition: CREATED -> QUEUED (during creation)
      expect(history[0].fromStatus).toBe('CREATED');
      expect(history[0].toStatus).toBe('QUEUED');
      // Last transition: QUEUED -> CANCELLED
      expect(history[history.length - 1].toStatus).toBe('CANCELLED');
    });

    it('should cancel all active order items when order is cancelled', async () => {
      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 2 },
        ],
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.id;

      await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .expect(200);

      // Verify all items are cancelled
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: orderId },
      });

      expect(orderItems.every(item => item.status === 'CANCELLED')).toBe(true);
    });
  });

  describe('Order Readiness Validation', () => {
    it('should not allow marking order as READY when items are not ready', async () => {
      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 1 },
        ],
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.id;

      // Try to mark as READY without items being ready
      const statusResponse = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'READY' })
        .expect(400);

      expect(statusResponse.body.error).toContain('Cannot mark order as READY');
    });

    it('should allow marking order as READY when all items are READY', async () => {
      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 1 },
        ],
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.id;
      const itemId = createResponse.body.items[0].id;

      // Mark item as READY first
      await request(app)
        .patch(`/api/orders/${orderId}/items/${itemId}/status`)
        .send({ status: 'READY' })
        .expect(200);

      // Now mark order as READY
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'READY' })
        .expect(200);
    });
  });

  describe('Unavailable Menu Items', () => {
    it('should prevent ordering unavailable menu items', async () => {
      // Make menu item unavailable
      await prisma.menuItem.update({
        where: { id: menuItemId },
        data: { available: false },
      });

      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 1 },
        ],
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('not available');

      // Verify no order was created
      const orders = await prisma.order.findMany();
      expect(orders).toHaveLength(0);
    });
  });

  describe('Order Status History', () => {
    it('should record all status transitions', async () => {
      const orderData = {
        items: [
          { menuItemId: menuItemId, quantity: 1 },
        ],
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.id;

      // Update status to PREPARING
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'PREPARING' })
        .expect(200);

      // Verify history
      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId: orderId },
        orderBy: { changedAt: 'asc' },
      });

      expect(history).toHaveLength(2);
      expect(history[0].fromStatus).toBe('CREATED');
      expect(history[0].toStatus).toBe('QUEUED');
      expect(history[1].fromStatus).toBe('QUEUED');
      expect(history[1].toStatus).toBe('PREPARING');
    });
  });
});
