import { OrderItem, MenuItem } from '@prisma/client';

/**
 * Check if an order item is delayed based on current time
 * Delay is derived, not stored as a status
 */
export function isOrderItemDelayed(
  item: OrderItem & { menuItem: MenuItem },
  orderCreatedAt: Date
): boolean {
  if (item.status === 'READY' || item.status === 'CANCELLED') {
    return false;
  }

  const estimatedCompletionTime = new Date(orderCreatedAt);
  estimatedCompletionTime.setMinutes(
    estimatedCompletionTime.getMinutes() + item.menuItem.estimatedTime
  );

  return new Date() > estimatedCompletionTime;
}

/**
 * Check if an order is delayed (any active item is delayed)
 */
export function isOrderDelayed(
  items: Array<OrderItem & { menuItem: MenuItem }>,
  orderCreatedAt: Date
): boolean {
  return items.some((item) => isOrderItemDelayed(item, orderCreatedAt));
}

/**
 * Check if all non-cancelled order items are READY
 */
export function areAllItemsReady(items: OrderItem[]): boolean {
  const activeItems = items.filter((item) => item.status !== 'CANCELLED');
  return activeItems.length > 0 && activeItems.every((item) => item.status === 'READY');
}

/**
 * Calculate total order amount
 */
export function calculateOrderTotal(
  items: Array<{ menuItem: MenuItem; quantity: number }>
): number {
  return items.reduce((total, item) => {
    return total + item.menuItem.price * item.quantity;
  }, 0);
}
