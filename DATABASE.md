# KitchenFlow - Database Documentation

**Repository:** [https://github.com/Kutloanodiale/KitchenFlow](https://github.com/Kutloanodiale/KitchenFlow)

## Overview

KitchenFlow uses a PostgreSQL database managed through Prisma ORM. The database is hosted on Supabase for production and can be run locally for development.

## Tables/Models

### Category

Groups menu items for filtering and organization.

| Column    | Type     | Constraints        |
|-----------|----------|--------------------|
| id        | String   | PK, auto-generated (CUID) |
| name      | String   | Unique             |
| createdAt | DateTime | Default: now()     |
| updatedAt | DateTime | Auto-updated       |

**Relationships:** One-to-many with MenuItem.

### KitchenStation

Identifies where preparation work is performed.

| Column    | Type     | Constraints        |
|-----------|----------|--------------------|
| id        | String   | PK, auto-generated (CUID) |
| name      | String   | Unique             |
| createdAt | DateTime | Default: now()     |
| updatedAt | DateTime | Auto-updated       |

**Relationships:** One-to-many with MenuItem and OrderItem.

### MenuItem

Represents a dish or drink available on the menu.

| Column          | Type     | Constraints        |
|-----------------|----------|--------------------|
| id              | String   | PK, auto-generated (CUID) |
| name            | String   | Required           |
| description     | String   | Optional           |
| price           | Float    | Required           |
| available       | Boolean  | Default: true      |
| estimatedTime   | Int      | Required (minutes) |
| categoryId      | String   | FK to Category     |
| stationId       | String   | FK to KitchenStation |
| createdAt       | DateTime | Default: now()     |
| updatedAt       | DateTime | Auto-updated       |

**Relationships:** Belongs to Category and KitchenStation. One-to-many with OrderItem and RecipeItem.

### Order

Represents a customer order with lifecycle tracking.

| Column        | Type        | Constraints        |
|---------------|-------------|--------------------|
| id            | String      | PK, auto-generated (CUID) |
| customerName  | String      | Optional           |
| tableNumber   | String      | Optional           |
| status        | OrderStatus | Default: CREATED   |
| totalAmount   | Float       | Default: 0         |
| createdAt     | DateTime    | Default: now()     |
| updatedAt     | DateTime    | Auto-updated       |

**Status Enum:** CREATED, QUEUED, PREPARING, READY, SERVED, CANCELLED

**Relationships:** One-to-many with OrderItem and OrderStatusHistory.

### OrderItem

Joins an order to a menu item with quantity and preparation state.

| Column       | Type            | Constraints        |
|--------------|-----------------|--------------------|
| id           | String          | PK, auto-generated (CUID) |
| orderId      | String          | FK to Order (Cascade delete) |
| menuItemId   | String          | FK to MenuItem     |
| stationId    | String          | FK to KitchenStation |
| quantity     | Int             | Required           |
| status       | OrderItemStatus | Default: QUEUED    |
| createdAt    | DateTime        | Default: now()     |
| updatedAt    | DateTime        | Auto-updated       |

**Status Enum:** QUEUED, PREPARING, READY, CANCELLED

### OrderStatusHistory

Records significant order-state transitions for audit purposes.

| Column     | Type        | Constraints        |
|------------|-------------|--------------------|
| id         | String      | PK, auto-generated (CUID) |
| orderId    | String      | FK to Order (Cascade delete) |
| fromStatus | OrderStatus | Nullable           |
| toStatus   | OrderStatus | Required           |
| changedAt  | DateTime    | Default: now()     |

### Ingredient

Stores ingredients with current and minimum stock levels.

| Column       | Type     | Constraints        |
|--------------|----------|--------------------|
| id           | String   | PK, auto-generated (CUID) |
| name         | String   | Unique             |
| unit         | String   | Required           |
| currentStock | Float    | Required           |
| minStock     | Float    | Required           |
| createdAt    | DateTime | Default: now()     |
| updatedAt    | DateTime | Auto-updated       |

**Relationships:** One-to-many with RecipeItem and InventoryMovement.

### RecipeItem

Joins menu items to ingredients with required quantities.

| Column           | Type     | Constraints                    |
|------------------|----------|--------------------------------|
| id               | String   | PK, auto-generated (CUID)      |
| menuItemId       | String   | FK to MenuItem (Cascade delete)|
| ingredientId     | String   | FK to Ingredient               |
| requiredQuantity | Float    | Required                       |
| createdAt        | DateTime | Default: now()                 |
| updatedAt        | DateTime | Auto-updated                   |

**Unique Constraint:** (menuItemId, ingredientId) combination.

### InventoryMovement

Records stock changes and their reasons for audit trail.

| Column          | Type           | Constraints        |
|-----------------|----------------|--------------------|
| id              | String         | PK, auto-generated (CUID) |
| ingredientId    | String         | FK to Ingredient   |
| quantityChange  | Float          | Required (negative for deductions) |
| reason          | MovementReason | Required           |
| referenceId     | String         | Optional (Order ID)|
| createdAt       | DateTime       | Default: now()     |

**MovementReason Enum:** ORDER_CONFIRMED, STOCK_ADJUSTMENT, STOCK_CORRECTION, INITIAL_STOCK

## Design Decisions

### Order State Management
Order status transitions are tracked through the OrderStatusHistory table. This provides a complete audit trail and allows analysis of order flow.

### Derived Values
- **Delayed status:** Calculated at runtime by comparing current time against estimated completion time (order creation time + menu item estimated preparation time). Not stored as a database field.
- **Low-stock status:** Derived by comparing currentStock against minStock. Not stored separately.
- **Order total:** Calculated from menu item prices and quantities at order creation time.

### Inventory Management
- Stock is deducted atomically when an order is confirmed using database transactions.
- Every stock change creates an InventoryMovement record for audit purposes.
- Repeated page refreshes do not deduct stock again because the order status moves to QUEUED after initial confirmation.

### Cascade Deletes
- Deleting an order cascades to its OrderItems and OrderStatusHistory.
- Deleting a menu item cascades to its RecipeItems.
- Ingredients and stations are not cascade-deleted to preserve historical data.

### Transactions
Order creation with inventory deduction uses Prisma transactions (`$transaction`) to ensure atomicity. Either all operations succeed or all fail together.
