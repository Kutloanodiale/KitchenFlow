# AI Usage Declaration

## Overview

AI assistance was used throughout the development of KitchenFlow for planning, code generation, debugging, and documentation. All AI-generated code was reviewed, tested, and modified as needed to meet project requirements.

## AI-Assisted Activities

### 1. Project Structure and Architecture

**Constraint supplied to AI:** "Create a monorepo structure with separate frontend and backend folders for a Next.js + Express + Prisma application using Supabase PostgreSQL."

**AI suggestion:** AI proposed a unified Next.js application with API routes.

**Decision:** Rejected the unified approach. The project requires clear separation between frontend and backend for better organization and maintainability. Implemented a monorepo with distinct `frontend/` and `backend/` directories.

**Rationale:** Separate folders make it easier to understand the architecture, deploy services independently, and manage dependencies. This aligns with industry best practices for full-stack applications.

### 2. Database Schema Design

**Constraint supplied to AI:** "Design a Prisma schema for a restaurant order management system with orders, menu items, kitchen stations, ingredients, recipes, and inventory tracking. Use Supabase PostgreSQL."

**AI contribution:** Generated initial schema with all required models and relationships.

**Modifications made:**
- Added `OrderStatusHistory` model for audit trail (AI initially omitted).
- Added `InventoryMovement` model for stock change tracking (AI suggested storing only current stock).
- Ensured all enums match the specification exactly (CREATED, QUEUED, PREPARING, READY, SERVED, CANCELLED).

**Rationale:** The specification explicitly requires audit trails and derived values. Storing only current stock would violate the requirement for traceable inventory movements.

### 3. Order Creation Logic

**Constraint supplied to AI:** "Implement order creation with inventory deduction. Ensure atomicity and prevent duplicate deductions on page refresh."

**AI suggestion:** Initially suggested deducting inventory before creating the order.

**Decision:** Corrected the approach. Inventory deduction must happen within the same transaction as order creation to ensure atomicity. The order status immediately transitions from CREATED to QUEUED to prevent re-deduction.

**Implementation:** Used Prisma's `$transaction` to wrap order creation, inventory deduction, and status update in a single atomic operation.

### 4. Delay Detection

**Constraint supplied to AI:** "Implement delay detection without storing delayed status in the database. Delay must be derived from timestamps."

**AI contribution:** Generated utility functions to calculate delay based on order creation time and estimated preparation time.

**No corrections needed.** The implementation correctly derives delay at runtime by comparing current time against `order.createdAt + menuItem.estimatedTime`.

### 5. Testing Strategy

**Constraint supplied to AI:** "Create at least 8 meaningful tests covering order creation, inventory deduction, insufficient stock, delay detection, and cancellation."

**AI suggestion:** Proposed testing only happy paths.

**Decision:** Expanded test coverage to include edge cases:
- Insufficient stock prevention.
- Duplicate inventory deduction prevention.
- Order readiness validation (all items must be READY).
- Cancellation retention in history.

**Rationale:** The specification requires behavioral tests that exercise real business rules, not just basic functionality.

### 6. Documentation

**Constraint supplied to AI:** "Write comprehensive documentation matching the specification requirements."

**AI contribution:** Generated initial drafts for README.md, DATABASE.md, THIRD-PARTY.md, and DOCKER.md.

**Modifications made:**
- Added Supabase-specific configuration details.
- Clarified that delayed status is derived, not stored.
- Added exact commands for all operations.
- Ensured all documentation matches the actual implementation.

## AI Tools Used

- **Code generation:** For boilerplate code, API routes, and component structure.
- **Debugging:** For identifying issues with Prisma queries and TypeScript types.
- **Documentation:** For generating initial drafts that were then reviewed and corrected.
- **Code review:** For identifying potential issues with business logic implementation.

## Evaluation and Rejection Examples

### Example 1: Database Choice

**AI suggestion:** Use SQLite for simplicity and local development.

**Decision:** Rejected. The specification requires PostgreSQL, and the project uses Supabase for production. SQLite would not demonstrate proper PostgreSQL-specific features and would make the Docker setup different from production.

**Final approach:** Use PostgreSQL via Supabase for both development and production, ensuring consistency.

### Example 2: State Management

**AI suggestion:** Store derived values like `isDelayed` and `isLowStock` as boolean columns in the database.

**Decision:** Rejected. The specification explicitly states: "Do not store derived states such as overdue/delayed/low-stock when they can be calculated from authoritative data."

**Final approach:** Calculate delay and low-stock status at runtime using utility functions and database queries.

### Example 3: API Architecture

**AI suggestion:** Use Next.js API routes for the backend.

**Decision:** Rejected for this project structure. While Next.js API routes are convenient, a separate Express backend provides clearer separation of concerns and makes the architecture more explicit for educational purposes.

**Final approach:** Use Express.js for the backend API, running on a separate port from the Next.js frontend.

## Limitations and Manual Work

- All business logic was manually reviewed and tested.
- Database schema was manually verified against the specification.
- Test cases were manually designed to cover edge cases.
- Documentation was manually edited to ensure accuracy.
- Docker configuration was manually tested for reproducibility.

## Conclusion

AI assistance accelerated development by providing initial code structures and suggestions, but all AI-generated code was critically evaluated, tested, and modified to meet the project's specific requirements. The final implementation reflects deliberate engineering decisions that sometimes diverged from AI suggestions based on the specification's constraints and best practices.
