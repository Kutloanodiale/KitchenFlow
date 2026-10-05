export enum OrderStatus {
  CREATED = 'CREATED',
  QUEUED = 'QUEUED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
}

export enum OrderItemStatus {
  QUEUED = 'QUEUED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  CANCELLED = 'CANCELLED',
}

export enum MovementReason {
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  STOCK_CORRECTION = 'STOCK_CORRECTION',
  INITIAL_STOCK = 'INITIAL_STOCK',
}

export interface CreateOrderDto {
  customerName?: string;
  tableNumber?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}

export interface UpdateOrderItemStatusDto {
  status: OrderItemStatus;
}

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  price: number;
  estimatedTime: number;
  categoryId: string;
  stationId: string;
}

export interface CreateIngredientDto {
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
}

export interface RecipeItemDto {
  ingredientId: string;
  requiredQuantity: number;
}
