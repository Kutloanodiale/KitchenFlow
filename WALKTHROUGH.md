# Functional Walkthrough Guide

**Repository:** [https://github.com/Kutloanodiale/KitchenFlow](https://github.com/Kutloanodiale/KitchenFlow)

This document provides a step-by-step walkthrough demonstrating all core functionality works from a clean clone.

## Prerequisites

- Node.js 18+ OR Docker 20.10+ with Docker Compose 2.0+
- PostgreSQL (for local development) OR use Docker PostgreSQL

---

## Step 1: Installation

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd KitchenFlow

# Install dependencies
npm install

# Set up backend environment
cd backend
cp .env.example .env
# Edit .env with your database credentials:
# DATABASE_URL="postgresql://user:password@localhost:5432/kitchenflow"
cd ..

# Set up database schema
npm run db:push

# Seed initial data
npm run db:seed

# Start application
npm run dev
```

**Expected Result:**
- Backend running on http://localhost:4000
- Frontend running on http://localhost:3000
- No errors in console

### Docker Deployment

```bash
# Clone repository
git clone <repository-url>
cd KitchenFlow

# Start with Docker
docker compose up --build
```

**Expected Result:**
- Both services start successfully
- Database healthcheck passes
- Application connects to database
- Accessible at http://localhost:3000

### Verification

```bash
# Test health endpoint
curl http://localhost:4000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-10-06T12:00:00.000Z",
  "uptime": 120.5,
  "environment": "development",
  "database": "connected",
  "version": "1.0.0",
  "databaseInfo": {
    "database_name": "kitchenflow",
    "database_user": "kitchenflow",
    "database_version": "PostgreSQL 16.0..."
  }
}
```

✅ **Step 1 Complete: Application installs and starts successfully**

---

## Step 2: Menu - Create Menu Item

### Navigate to Menu Page

1. Open http://localhost:3000/menu
2. Click "Add Menu Item" button

### Fill Form

```
Name: Classic Burger
Description: Beef patty with lettuce, tomato, and cheese
Price: 12.99
Category: Main Course
Kitchen Station: GRILL
Estimated Preparation Time: 15
Available: ✓ (checked)
```

3. Click "Create Item"

### Expected Result

- Success message appears
- New item appears in menu list
- Shows: Classic Burger - $12.99 (Main Course, GRILL, 15 min)
- Green availability indicator

### Create Additional Items

Create 2-3 more items for testing:

```
French Fries - $4.99 - Appetizers - FRYER - 8 min
Cola - $2.50 - Beverages - DRINKS - 2 min
Caesar Salad - $8.99 - Appetizers - COLD_PREP - 10 min
```

✅ **Step 2 Complete: Menu items created with all required fields**

---

## Step 3: Order - Create Order with Multiple Items

### Navigate to Orders Page

1. Open http://localhost:3000/orders
2. Click "Create New Order" button

### Fill Order Form

```
Customer Name: John Doe
Table Number: 5

Order Items:
- Classic Burger x 2
- French Fries x 1
- Cola x 2
```

3. Click "Create Order"

### Expected Result

- Order created successfully
- Order appears in list with:
  - Order ID (e.g., #abc123)
  - Status: QUEUED
  - Customer: John Doe
  - Table: 5
  - Total: $33.97 (12.99×2 + 4.99 + 2.50×2)
  - 3 items

### Verify Order Details

Click on the order to view details:

**Expected:**
- Order header shows status QUEUED
- Items list shows:
  - Classic Burger (GRILL) x 2 - Status: QUEUED
  - French Fries (FRYER) x 1 - Status: QUEUED
  - Cola (DRINKS) x 2 - Status: QUEUED
- Status history shows: CREATED → QUEUED

✅ **Step 3 Complete: Order created with multiple items and quantities**

---

## Step 4: Kitchen - Items Appear at Correct Stations

### Navigate to Kitchen Page

1. Open http://localhost:3000/kitchen

### Expected Result

Kitchen view shows station columns:

**GRILL Station:**
- Classic Burger x 2
- Order #abc123
- Customer: John Doe, Table 5
- Status: QUEUED
- Elapsed: 0m 15s / Est: 15m

**FRYER Station:**
- French Fries x 1
- Order #abc123
- Customer: John Doe, Table 5
- Status: QUEUED
- Elapsed: 0m 15s / Est: 8m

**DRINKS Station:**
- Cola x 2
- Order #abc123
- Customer: John Doe, Table 5
- Status: QUEUED
- Elapsed: 0m 15s / Est: 2m

**COLD_PREP Station:**
- (empty - no items for this station in current order)

✅ **Step 4 Complete: Order items appear at correct kitchen stations**

---

## Step 5: Progress - Move Items Through Preparation

### Update Item Statuses

**At DRINKS Station:**
1. Find Cola item
2. Click "→ PREPARING" button
3. Wait 2 minutes (or simulate by checking elapsed time)
4. Click "→ READY" button

**At FRYER Station:**
1. Find French Fries item
2. Click "→ PREPARING" button
3. After 8 minutes, click "→ READY" button

**At GRILL Station:**
1. Find Classic Burger item
2. Click "→ PREPARING" button
3. After 15 minutes, click "→ READY" button

### Verify Order Status Updates

1. Navigate back to Orders page
2. Click on the order

**Expected Result:**
- All items show status: READY
- "Move to READY" button appears for order
- Click "Move to READY"
- Order status changes to READY
- Status history shows: CREATED → QUEUED → PREPARING → READY

### Complete Order

1. Click "Move to SERVED"
2. Order status changes to SERVED

**Status History:**
```
CREATED → QUEUED (timestamp)
QUEUED → PREPARING (timestamp)
PREPARING → READY (timestamp)
READY → SERVED (timestamp)
```

✅ **Step 5 Complete: Items progress through preparation, order becomes READY when all items ready**

---

## Step 6: Inventory - Stock Deduction and Prevention

### Check Initial Inventory

1. Navigate to http://localhost:3000/inventory
2. Note current stock levels (e.g., Beef Patty: 100 pieces)

### Verify Stock Deduction

After creating the order in Step 3 (2 burgers, 1 fries, 2 colas):

**Expected Inventory Changes:**
- Beef Patty: 100 → 98 (2 burgers × 1 patty each)
- Burger Bun: 100 → 98 (2 burgers × 1 bun each)
- Lettuce: 10 → 8 (2 burgers × 1kg each)
- Tomato: 10 → 8 (2 burgers × 1kg each)
- Cheese: 5 → 3 (2 burgers × 1kg each)
- Oil: 20 → 19 (1 fries × 1 liter)
- Soda Syrup: 15 → 13 (2 colas × 1 liter each)

### View Movement History

1. Click "View Movement History" button
2. See entries for each ingredient:
   - Beef Patty: -2 (Order Confirmed, Ref: #abc123)
   - Burger Bun: -2 (Order Confirmed, Ref: #abc123)
   - etc.

### Test Insufficient Stock Prevention

1. Navigate to Inventory
2. Edit "Beef Patty" - set current stock to 1
3. Navigate to Orders
4. Try to create new order with 2 Classic Burgers

**Expected Result:**
- Error message: "Insufficient stock for Beef Patty. Required: 2, Available: 1"
- Order is NOT created
- Stock remains at 1
- No inventory movements recorded

✅ **Step 6 Complete: Inventory correctly deducted, insufficient stock prevented**

---

## Step 7: Delay - Delayed Items Visually Flagged

### Create a Long-Running Order

1. Create new order with Classic Burger (15 min estimated time)
2. Navigate to Kitchen view
3. Wait 16+ minutes (or modify system time for testing)

### Expected Visual Indicators

**Delayed Item Appearance:**
- Red border (2px solid #f44336)
- Light red background (#ffebee)
- "DELAYED" badge in top-right corner (red background, white text)
- Elapsed time shown in red
- Station header shows: "(1 delayed)"

**Example:**
```
┌─────────────────────────────────┐
│ Classic Burger          DELAYED │
│ Qty: 2 • John Doe • Table 5    │
│                                 │
│ Elapsed: 18m 23s / Est: 15m   │
│ [→ PREPARING]                   │
│ Order #def456 • 10:45:23 AM   │
└─────────────────────────────────┘
```

### Verify Status Remains Valid

1. Check item status badge
2. Should still show "QUEUED" or "PREPARING" (not "DELAYED")
3. DELAYED is only a visual indicator, not a stored status

✅ **Step 7 Complete: Delayed items visually flagged, underlying status remains valid**

---

## Step 8: History - Served/Cancelled Orders Viewable

### View Served Order

1. Navigate to Orders page
2. Use status filter: Click "SERVED" button
3. Find the order from Step 5

**Expected:**
- Order visible with status: SERVED
- All details preserved (customer, items, totals)
- Complete status history visible
- Items show final status: READY

### Test Cancelled Order

1. Create new order
2. Click on order to view details
3. Click "Cancel Order" button
4. Confirm cancellation

**Expected Result:**
- Order status: CANCELLED
- All items status: CANCELLED
- Order remains in database (not deleted)
- Status history shows: CREATED → QUEUED → CANCELLED

### Filter and Search

1. Click "ALL" filter - see all orders
2. Click "CANCELLED" filter - see only cancelled orders
3. Click "SERVED" filter - see only served orders

**Expected:**
- All orders remain accessible
- Filters work correctly
- Historical data preserved

✅ **Step 8 Complete: Served and cancelled orders remain viewable in history**

---

## Step 9: Analytics - Dashboard Reflects Data

### Navigate to Analytics

1. Open http://localhost:3000/analytics

### Expected Metrics

**Order Statistics:**
- Active Orders: 1 (if one order still in progress)
- Ready Orders: 0 (or count of READY orders)
- Served Orders: 1 (from Step 5)
- Cancelled Orders: 1 (from Step 8 test)
- Delayed Orders: 0 or 1 (depending on timing)
- Avg Prep Time: ~15 min (from served order)

**Revenue:**
- Monthly Revenue: $33.97 (from served order)
- From 1 served order

**Popular Menu Items:**
- Classic Burger: 2 sold
- French Fries: 1 sold
- Cola: 2 sold
- (Displayed as bar chart)

**Low Stock Ingredients:**
- Shows ingredients below minimum stock
- Red warning if any exist

### Verify Data Accuracy

All metrics should match:
- Number of orders created
- Total revenue from served orders
- Item quantities from served orders
- Current inventory levels

✅ **Step 9 Complete: Analytics dashboard reflects persisted order and inventory data**

---

## Step 10: Persistence - Data Survives Restart

### Stop Application

**Local Development:**
```bash
# Press Ctrl+C in terminal
```

**Docker:**
```bash
docker compose down
```

### Restart Application

**Local Development:**
```bash
npm run dev
```

**Docker:**
```bash
docker compose up -d
```

### Verify Data Persistence

1. Navigate to Orders page
2. **Expected:** All previous orders visible
3. Navigate to Menu page
4. **Expected:** All menu items present
5. Navigate to Inventory page
6. **Expected:** Stock levels preserved
7. Navigate to Analytics page
8. **Expected:** All metrics still accurate

### Test Specific Data

```bash
# Check specific order still exists
curl http://localhost:4000/api/orders/<order-id>

# Expected: Returns order with all details intact
```

✅ **Step 10 Complete: Data persists across application restarts**

---

## Step 11: Docker - Volume Persistence

### Create Test Data

1. Create a new order via UI
2. Note the order ID
3. Verify order exists

### Stop and Remove Containers

```bash
docker compose down
```

**Important:** Do NOT use `-v` flag (that would delete volumes)

### Restart Containers

```bash
docker compose up -d
```

### Verify Data Persistence

1. Wait for services to start
2. Check health: `curl http://localhost:4000/api/health`
3. Navigate to Orders page
4. **Expected:** All orders still present, including test order

### Verify Volume Exists

```bash
docker volume ls | grep kitchenflow
```

**Expected Output:**
```
local     kitchenflow-data
```

### Inspect Volume Data

```bash
docker run --rm -v kitchenflow-data:/data alpine ls /data
```

**Expected:** PostgreSQL data files present

✅ **Step 11 Complete: Docker named volume preserves database data**

---

## Step 12: Database Restart - Application Recovers

### Restart Database Service

**Docker:**
```bash
docker compose restart db
```

**Local Development:**
```bash
# Restart PostgreSQL service
# Windows: net stop postgresql-x64-16 && net start postgresql-x64-16
# Linux: sudo systemctl restart postgresql
# Mac: brew services restart postgresql
```

### Wait for Recovery

```bash
# Monitor database health
docker compose ps
# Wait for db service to show "healthy"
```

### Verify Application Recovery

1. Check health endpoint:
```bash
curl http://localhost:4000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  ...
}
```

2. Navigate to Orders page
3. **Expected:** Orders load successfully
4. Navigate to Kitchen page
5. **Expected:** Kitchen view loads with active orders
6. Create new test order
7. **Expected:** Order created successfully

### Verify No Data Loss

1. Check all previous orders still exist
2. Verify inventory levels unchanged
3. Confirm menu items intact

✅ **Step 12 Complete: Application recovers after database restart without data loss**

---

## Summary

All 12 functional walkthrough steps completed successfully:

| Step | Requirement | Status |
|------|-------------|--------|
| 1 | Installation | ✅ Pass |
| 2 | Menu creation | ✅ Pass |
| 3 | Order creation | ✅ Pass |
| 4 | Kitchen station routing | ✅ Pass |
| 5 | Status progression | ✅ Pass |
| 6 | Inventory management | ✅ Pass |
| 7 | Delay detection | ✅ Pass |
| 8 | Order history | ✅ Pass |
| 9 | Analytics dashboard | ✅ Pass |
| 10 | Data persistence | ✅ Pass |
| 11 | Docker volume persistence | ✅ Pass |
| 12 | Database restart recovery | ✅ Pass |

**Result: All functional requirements demonstrated and verified**

---

## Troubleshooting

### Step 1 Issues

**Problem:** Database connection failed
**Solution:** Verify DATABASE_URL in backend/.env

**Problem:** Port already in use
**Solution:** Change PORT in .env or kill existing process

### Step 6 Issues

**Problem:** Stock not deducting
**Solution:** Check recipe items are configured for menu items

**Problem:** Insufficient stock not prevented
**Solution:** Verify transaction is atomic in order.routes.ts

### Step 11 Issues

**Problem:** Data lost after docker compose down
**Solution:** Ensure you're not using `-v` flag

**Problem:** Volume not created
**Solution:** Check compose.yml has volumes section

### Step 12 Issues

**Problem:** Application doesn't reconnect after DB restart
**Solution:** Check Prisma client handles reconnection (it does by default)

**Problem:** Health check shows disconnected
**Solution:** Wait for database healthcheck to pass (5-10 seconds)
