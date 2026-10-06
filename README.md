# KitchenFlow - Restaurant Operations & Order Management System

**Repository:** [https://github.com/Kutloanodiale/KitchenFlow](https://github.com/Kutloanodiale/KitchenFlow)

KitchenFlow is a comprehensive restaurant operations and order management system designed to streamline kitchen workflows, track orders in real-time, manage inventory, and provide analytics for restaurant operations.

## 📋 Project Overview

KitchenFlow enables restaurants to:
- Track orders through their complete lifecycle (CREATED → QUEUED → PREPARING → READY → SERVED)
- Route order items to appropriate kitchen stations (GRILL, FRYER, DRINKS, COLD_PREP, DESSERT)
- Monitor preparation times and detect delays in real-time
- Manage menu items with categories, pricing, and recipe ingredients
- Track inventory levels and automatically deduct stock when orders are confirmed
- View analytics dashboard with order statistics, revenue, and popular items
- Maintain complete audit trails for order status changes and inventory movements

## ✨ Features Implemented

### Order Management (2.1)
- Create orders with multiple menu items and quantities
- Optional customer name and table number tracking
- Complete order lifecycle: CREATED, QUEUED, PREPARING, READY, SERVED, CANCELLED
- Validation prevents marking orders READY until all items are complete
- Cancelled orders preserved in history (soft delete)
- View orders with items, station information, and status history

### Kitchen Station Integration (2.2)
- Menu items assigned to kitchen stations
- Kitchen view groups active work by station
- Item status progression: QUEUED → PREPARING → READY → CANCELLED
- Real-time elapsed preparation time display
- Delayed items visually distinguished (red border, badge) without stored status
- Auto-refresh every 5 seconds for live updates

### Menu Management (2.3)
- Create and edit menu items with all required fields
- Fields: name, description, price, category, station, estimated preparation time
- Toggle availability without deletion
- Unavailable items cannot be added to new orders
- Category-based filtering and organization

### Inventory & Recipes (2.4)
- Store ingredients with current and minimum stock levels
- Recipe management linking menu items to ingredients
- Automatic inventory deduction on order confirmation
- Insufficient stock prevention (orders rejected if stock unavailable)
- Low-stock warnings derived from current vs minimum quantities
- Complete inventory movement audit trail

### Dashboard & Analytics (2.5)
- Order counts by status (active, ready, served, cancelled)
- Delayed order count
- Average preparation time for completed orders
- Monthly revenue statistics
- Popular menu items based on sales
- Low-stock ingredient alerts
- All metrics calculated from persisted data

### Database Design (4)
- Relational PostgreSQL database with Prisma ORM
- 9 core entities with proper relationships
- Primary and foreign keys consistently used
- Uniqueness constraints prevent invalid duplicates
- Derived states (delayed, low-stock) calculated at runtime
- Database transactions ensure atomic operations
- Complete audit trails for orders and inventory

### Automated Testing (5)
- 13 meaningful automated tests
- Unit tests for utility functions
- Integration tests for API endpoints
- Coverage: order creation, inventory deduction, insufficient stock, delay detection, cancellation
- Tests use isolated database and run with single command

### Docker Containerization (6)
- Multi-stage Docker build for production
- PostgreSQL database service
- Named volumes for data persistence
- Health checks for both services
- Non-root user for security
- One-command deployment

## 📦 Prerequisites

### For Local Development
- **Node.js**: Version 18 or higher (LTS recommended)
- **npm**: Version 8 or higher (comes with Node.js)
- **Database**: PostgreSQL (via Supabase or local)

### For Docker Deployment
- **Docker Engine**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

## 🚀 Installation

### Clean Clone Installation

```bash
# Clone the repository
git clone <repository-url>
cd KitchenFlow

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Set up environment variables
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
npm run db:push

# Seed initial data
npm run db:seed

# Return to root
cd ..
```

## 💻 Development

### Run Development Servers

```bash
# Start both backend and frontend concurrently
npm run dev
```

This starts:
- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:3000

### Run Individual Services

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

This executes 13 automated tests covering:
- Order creation and persistence
- Inventory deduction
- Insufficient stock prevention
- Delayed order detection
- Order cancellation and history retention
- Order readiness validation
- Unavailable menu items

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## 🏗️ Production Build

### Build Application

```bash
npm run build
```

### Start Production Servers

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 🐳 Docker Deployment

### Start Application with Docker

```bash
# Build and start all services
docker compose up --build

# Or start in detached mode
docker compose up -d --build
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

### Docker Commands

```bash
# View logs
docker compose logs -f

# Stop application (data persists)
docker compose down

# Stop and remove data
docker compose down -v

# Restart services
docker compose restart

# Rebuild after changes
docker compose up --build
```

## 🔧 Environment Variables

### Backend (.env or backend/.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | `postgresql://user:password@host:5432/kitchenflow` |
| `BACKEND_PORT` | No | Backend server port (default: 4000) | `4000` |
| `NODE_ENV` | No | Environment (development/production) | `development` |

### Frontend (.env.local or frontend/.env.local)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | No | Backend API URL (default: http://localhost:4000) | `http://localhost:4000` |

### Docker (compose.yml)

Docker deployment uses these environment variables (configured in compose.yml):

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `DATABASE_URL` | `postgresql://kitchenflow:kitchenflow_secret@db:5432/kitchenflow` | Database connection |
| `BACKEND_PORT` | `4000` | Backend port |
| `PORT` | `3000` | Frontend port |

## 🗄️ Database Migration & Initialization

### Push Schema to Database

```bash
npm run db:push
```

This creates all tables based on the Prisma schema.

### Seed Initial Data

```bash
npm run db:seed
```

This creates:
- 4 categories (Appetizers, Main Course, Desserts, Beverages)
- 5 kitchen stations (GRILL, FRYER, DRINKS, COLD_PREP, DESSERT)
- 8 ingredients with initial stock levels

### Open Prisma Studio

```bash
npm run db:studio
```

Visual database browser at http://localhost:5555

## 🛑 Stopping the Application

### Local Development

```bash
# Press Ctrl+C in the terminal running npm run dev
```

### Docker

```bash
# Stop containers (data persists)
docker compose down

# Stop and remove all data
docker compose down -v
```

## 🏥 Health Check Endpoint

### Verify Application Health

```bash
curl http://localhost:4000/api/health
```

**Expected Response** (healthy):
```json
{
  "status": "ok",
  "timestamp": "2026-10-06T12:00:00.000Z",
  "uptime": 3600.5,
  "environment": "production",
  "database": "connected",
  "version": "1.0.0",
  "databaseInfo": {
    "database_name": "kitchenflow",
    "database_user": "kitchenflow",
    "database_version": "PostgreSQL 16.0..."
  }
}
```

**Error Response** (database disconnected):
```json
{
  "status": "error",
  "timestamp": "2026-10-06T12:00:00.000Z",
  "uptime": 3600.5,
  "environment": "production",
  "database": "disconnected",
  "version": "1.0.0",
  "error": "Connection refused"
}
```

The health endpoint provides:
- Application status
- Database connectivity
- Server uptime
- Environment information
- Database metadata (name, user, version - no secrets)
- Error details when unhealthy

## 🔍 Troubleshooting

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::4000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Database Connection Failed

**Problem**: Health check shows `database: "disconnected"`

**Solutions**:
1. Verify `DATABASE_URL` in backend/.env
2. Check database is running and accessible
3. Ensure credentials are correct
4. For Docker: verify database container is healthy (`docker compose ps`)

### Prisma Client Not Generated

**Problem**: `Error: Cannot find module '@prisma/client'`

**Solution**:
```bash
npx prisma generate
```

### Tests Fail

**Problem**: Tests fail with database errors

**Solutions**:
1. Ensure database is running
2. Verify `DATABASE_URL` is configured
3. Run `npm run db:push` to ensure schema exists

### Docker Build Fails

**Problem**: Docker build fails with dependency errors

**Solutions**:
1. Clean Docker cache: `docker system prune -a`
2. Rebuild without cache: `docker compose build --no-cache`
3. Check package-lock.json exists

### Frontend Cannot Connect to Backend

**Problem**: Frontend shows "Failed to fetch" errors

**Solutions**:
1. Verify backend is running on port 4000
2. Check `NEXT_PUBLIC_API_URL` in frontend/.env.local
3. Ensure CORS is enabled in backend
4. For Docker: verify both services are on same network

## 📚 Documentation

- **[DATABASE.md](DATABASE.md)** - Database schema and design decisions
- **[DOCKER.md](DOCKER.md)** - Docker deployment guide
- **[TESTING.md](TESTING.md)** - Testing documentation
- **[THIRD-PARTY.md](THIRD-PARTY.md)** - Third-party dependencies
- **[AI-USAGE.md](AI-USAGE.md)** - AI-assisted development log
- **[WALKTHROUGH.md](WALKTHROUGH.md)** - Functional walkthrough guide (12 steps)
- **[RUBRIC-ASSESSMENT.md](RUBRIC-ASSESSMENT.md)** - Rubric self-assessment

## 📄 License

This project is created for academic purposes as part of COMS3011A.

## 🤝 Contributing

This is an academic project. For educational purposes, contributions and feedback are welcome.
