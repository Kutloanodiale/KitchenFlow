import { isOrderItemDelayed, isOrderDelayed, areAllItemsReady, calculateOrderTotal } from '../src/lib/utils';

describe('Order Utils', () => {
  describe('isOrderItemDelayed', () => {
    it('should return false for READY items', () => {
      const item = {
        id: '1',
        status: 'READY',
        createdAt: new Date(),
        updatedAt: new Date(),
        orderId: 'order1',
        menuItemId: 'menu1',
        stationId: 'station1',
        quantity: 1,
        menuItem: {
          id: 'menu1',
          name: 'Burger',
          price: 10,
          estimatedTime: 15,
          available: true,
          categoryId: 'cat1',
          stationId: 'station1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      const orderCreatedAt = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      expect(isOrderItemDelayed(item, orderCreatedAt)).toBe(false);
    });

    it('should return true for delayed QUEUED items', () => {
      const item = {
        id: '1',
        status: 'QUEUED',
        createdAt: new Date(),
        updatedAt: new Date(),
        orderId: 'order1',
        menuItemId: 'menu1',
        stationId: 'station1',
        quantity: 1,
        menuItem: {
          id: 'menu1',
          name: 'Burger',
          price: 10,
          estimatedTime: 15,
          available: true,
          categoryId: 'cat1',
          stationId: 'station1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      const orderCreatedAt = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      expect(isOrderItemDelayed(item, orderCreatedAt)).toBe(true);
    });
  });

  describe('areAllItemsReady', () => {
    it('should return true when all active items are READY', () => {
      const items = [
        { id: '1', status: 'READY', orderId: 'o1', menuItemId: 'm1', stationId: 's1', quantity: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', status: 'CANCELLED', orderId: 'o1', menuItemId: 'm2', stationId: 's1', quantity: 1, createdAt: new Date(), updatedAt: new Date() },
      ];
      expect(areAllItemsReady(items)).toBe(true);
    });

    it('should return false when some items are not READY', () => {
      const items = [
        { id: '1', status: 'READY', orderId: 'o1', menuItemId: 'm1', stationId: 's1', quantity: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', status: 'PREPARING', orderId: 'o1', menuItemId: 'm2', stationId: 's1', quantity: 1, createdAt: new Date(), updatedAt: new Date() },
      ];
      expect(areAllItemsReady(items)).toBe(false);
    });
  });

  describe('calculateOrderTotal', () => {
    it('should calculate correct total', () => {
      const items = [
        { menuItem: { id: '1', name: 'Burger', price: 10, description: null, available: true, estimatedTime: 15, categoryId: 'c1', stationId: 's1', createdAt: new Date(), updatedAt: new Date() }, quantity: 2 },
        { menuItem: { id: '2', name: 'Fries', price: 5, description: null, available: true, estimatedTime: 10, categoryId: 'c1', stationId: 's1', createdAt: new Date(), updatedAt: new Date() }, quantity: 3 },
      ];
      expect(calculateOrderTotal(items)).toBe(35);
    });
  });
});
