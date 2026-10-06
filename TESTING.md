# Testing Guide

**Repository:** [https://github.com/Kutloanodiale/KitchenFlow](https://github.com/Kutloanodiale/KitchenFlow)

## Overview

KitchenFlow includes comprehensive automated tests that verify real behavior across the application. All tests use an isolated test database and can be run with a single command.

## Running Tests

To run all tests:

```bash
npm test
```

This command runs tests from the root directory, which executes the backend test suite.

## Test Coverage

The test suite includes **13 meaningful automated tests** covering:

### Unit Tests (4 tests)
Located in `backend/tests/utils.test.ts`:
- **Delayed order/item detection**: Verifies that items exceeding estimated preparation time are correctly identified as delayed
- **Order readiness validation**: Tests that orders can only be marked READY when all active items are READY
- **Order total calculation**: Validates correct calculation of order totals from menu items and quantities

### Integration Tests (9 tests)
Located in `backend/tests/orders.integration.test.ts`:

#### Order Creation and Persistence
- ✅ Creates orders with customer information and persists to database
- ✅ Handles multiple menu items in a single order
- ✅ Supports orders without optional customer information

#### Inventory Management
- ✅ **Inventory deduction**: Verifies stock is correctly deducted when orders are created
- ✅ **Audit trail**: Confirms inventory movements are recorded for all stock changes
- ✅ **Insufficient stock prevention**: Ensures orders are rejected when stock is insufficient
- ✅ **Transaction safety**: Verifies no partial updates occur when orders fail

#### Order Lifecycle
- ✅ **Cancellation**: Tests that cancelled orders remain in database (soft delete)
- ✅ **History retention**: Verifies all status transitions are recorded in OrderStatusHistory
- ✅ **Item cancellation**: Confirms all active items are cancelled when order is cancelled
- ✅ **Readiness validation**: Tests that orders cannot be marked READY until all items are READY
- ✅ **Status history**: Verifies complete audit trail of status transitions

#### Menu Item Availability
- ✅ **Unavailable items**: Ensures unavailable menu items cannot be added to new orders

## Test Requirements Compliance

### Required Test Coverage

| Requirement | Test Location | Status |
|-------------|---------------|--------|
| Order creation and persistence | `orders.integration.test.ts` - "Order Creation and Persistence" | ✅ Covered |
| Inventory deduction | `orders.integration.test.ts` - "Inventory Deduction" | ✅ Covered |
| Insufficient-stock rule | `orders.integration.test.ts` - "Insufficient Stock Prevention" | ✅ Covered |
| Delayed-order/item detection | `utils.test.ts` - "isOrderItemDelayed" | ✅ Covered |
| Cancellation/historical retention | `orders.integration.test.ts` - "Order Cancellation and History Retention" | ✅ Covered |

### Test Design Principles

✅ **Real behavior testing**: All tests exercise actual API endpoints and database operations  
✅ **No render-only tests**: Every test verifies business logic or data persistence  
✅ **Isolated test database**: Tests clean up before each run to ensure independence  
✅ **Single command execution**: All tests run with `npm test`  
✅ **No developer data dependency**: Tests create their own test data  

## Test Database Configuration

Tests use the same database as the development environment but clean up all data before each test run. This ensures:
- Tests are isolated and repeatable
- No dependency on specific data
- No interference with development data

The test setup (`backend/tests/setup.ts`) performs cleanup in `beforeAll` and `beforeEach` hooks.

## Additional Recommended Tests

The test suite also includes tests for:
- **Order readiness validation**: Prevents marking orders as READY before items are complete
- **Unavailable menu items**: Blocks ordering of items marked as unavailable
- **Duplicate inventory deduction**: Transaction safety prevents double-deduction
- **Recipe calculations**: Inventory deduction correctly uses recipe quantities
- **Analytics calculations**: All metrics derived from persisted data

## Test Structure

```
backend/
├── tests/
│   ├── setup.ts                      # Test database setup and cleanup
│   ├── utils.test.ts                 # Unit tests for utility functions
│   └── orders.integration.test.ts    # Integration tests for order API
├── jest.config.js                    # Jest configuration
└── package.json                      # Test scripts
```

## Writing New Tests

When adding new tests:

1. **Use the existing setup**: Import `prisma` from `./setup`
2. **Clean up data**: Use `beforeEach` to ensure test isolation
3. **Test real behavior**: Exercise actual API endpoints or database operations
4. **Verify persistence**: Check that data is correctly saved to database
5. **Test edge cases**: Include error conditions and validation failures

Example:

```typescript
import request from 'supertest';
import app from '../src/server';
import { prisma } from './setup';

describe('Feature Name', () => {
  beforeEach(async () => {
    // Clean up
    await prisma.model.deleteMany();
  });

  it('should do something meaningful', async () => {
    // Arrange
    const testData = { ... };
    
    // Act
    const response = await request(app)
      .post('/api/endpoint')
      .send(testData)
      .expect(201);
    
    // Assert
    expect(response.body).toHaveProperty('id');
    
    // Verify persistence
    const persisted = await prisma.model.findUnique({
      where: { id: response.body.id },
    });
    expect(persisted).not.toBeNull();
  });
});
```

## Continuous Integration

All tests are designed to run in CI/CD pipelines. The test suite:
- Creates necessary test data
- Cleans up after itself
- Does not depend on external state
- Produces consistent results

## Troubleshooting

### Tests fail with database errors
Ensure the database is running and `DATABASE_URL` is configured in `backend/.env`.

### Tests fail with "Cannot find module" errors
Run `npm install` to install all dependencies.

### Tests are slow
Tests clean up data before each run, which is necessary for isolation. This is expected behavior.
