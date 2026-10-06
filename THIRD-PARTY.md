# Third-Party Dependencies

This document lists all important third-party libraries and packages used in KitchenFlow, along with their purpose and role in the project.

## Runtime Dependencies

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| **@prisma/client** | ^5.10.0 | Type-safe database client for PostgreSQL, auto-generated from schema to provide safe database access with full TypeScript support. |
| **cors** | ^2.8.5 | Enables Cross-Origin Resource Sharing to allow the frontend (port 3000) to communicate with the backend (port 4000) during development and production. |
| **dotenv** | ^16.4.5 | Loads environment variables from .env files into process.env, enabling secure configuration of database credentials and other sensitive settings. |
| **express** | ^4.18.2 | Web framework for Node.js used to build the REST API, handle HTTP requests, and route API endpoints for orders, menu, inventory, and analytics. |
| **zod** | ^3.22.4 | TypeScript-first schema validation library used to validate API request bodies and ensure data integrity before processing. |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| **next** | 14.1.0 | React framework providing server-side rendering, file-based routing, and optimized production builds for the user interface. |
| **react** | ^18.2.0 | JavaScript library for building user interfaces, used to create interactive components for orders, kitchen view, menu management, and analytics. |
| **react-dom** | ^18.2.0 | React package for DOM rendering, enabling React components to be rendered in the browser. |

### Database

| Service | Version | Purpose |
|---------|---------|---------|
| **PostgreSQL** | 16 | Primary relational database providing robust data storage, transactions, and referential integrity for all application data. |

### Docker

| Image | Version | Purpose |
|-------|---------|---------|
| **postgres** | 16-alpine | Official PostgreSQL Docker image providing the database service in containerized deployments with minimal image size. |
| **node** | 20-alpine | Official Node.js Docker image used for building and running the application in containers with LTS support. |

## Development Dependencies

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| **@types/cors** | ^2.8.17 | TypeScript type definitions for cors package, enabling type-safe CORS configuration. |
| **@types/express** | ^4.17.21 | TypeScript type definitions for Express framework, providing type safety for routes, middleware, and request/response handling. |
| **@types/jest** | ^29.5.12 | TypeScript type definitions for Jest testing framework, enabling type-safe test writing. |
| **@types/node** | ^20.11.24 | TypeScript type definitions for Node.js, providing types for built-in Node.js modules and APIs. |
| **@types/supertest** | ^6.0.2 | TypeScript type definitions for Supertest, enabling type-safe HTTP testing of API endpoints. |
| **jest** | ^29.7.0 | JavaScript testing framework used to write and run unit and integration tests for business logic and API endpoints. |
| **prisma** | ^5.10.0 | Next-generation ORM for Node.js, used to define the database schema, generate migrations, and provide type-safe database access. |
| **supertest** | ^6.3.4 | HTTP assertion library for testing Express API endpoints, enabling integration tests that verify real HTTP behavior. |
| **ts-jest** | ^29.1.2 | Jest transformer for TypeScript, allowing Jest to run TypeScript tests without manual compilation. |
| **tsx** | ^4.7.1 | TypeScript execution engine for Node.js, used to run TypeScript files directly during development without manual compilation. |
| **typescript** | ^5.3.3 | TypeScript compiler and language service, providing static type checking and enhanced developer experience across the entire codebase. |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| **@types/node** | ^20.11.19 | TypeScript type definitions for Node.js, providing types for Next.js build process and development tools. |
| **@types/react** | ^18.2.57 | TypeScript type definitions for React, enabling type-safe component development with proper prop and state typing. |
| **@types/react-dom** | ^18.2.19 | TypeScript type definitions for React DOM, providing types for React's DOM rendering APIs. |
| **eslint** | ^8.56.0 | JavaScript linter that analyzes code for potential errors and enforces coding standards in the frontend codebase. |
| **eslint-config-next** | 14.1.0 | ESLint configuration preset for Next.js applications, providing optimized linting rules for Next.js projects. |

### Root (Monorepo)

| Package | Version | Purpose |
|---------|---------|---------|
| **concurrently** | ^8.2.2 | Runs multiple commands concurrently, used to start both backend and frontend development servers simultaneously with `npm run dev`. |

## Testing Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| **jest** | ^29.7.0 | Testing framework for running automated tests, providing test runner, assertions, and mocking capabilities. |
| **supertest** | ^6.3.4 | HTTP testing library for integration tests, enabling real HTTP requests to API endpoints for verification. |
| **ts-jest** | ^29.1.2 | TypeScript preprocessor for Jest, allowing tests written in TypeScript to be executed without manual compilation. |

## Database Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Prisma** | ^5.10.0 | Database toolkit providing schema definition, migrations, client generation, and visual database browser (Prisma Studio). |
| **PostgreSQL** | 16 | Relational database management system providing data persistence, transactions, and referential integrity. |

## Containerization Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Docker** | 20.10+ | Container platform for packaging the application and dependencies into portable, reproducible images. |
| **Docker Compose** | 2.0+ | Tool for defining and running multi-container Docker applications, orchestrating the app and database services. |

## Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **TypeScript** | ^5.3.3 | Compiles TypeScript to JavaScript, providing type safety and modern language features during development. |
| **Next.js Build** | 14.1.0 | Optimizes and bundles the React application for production deployment with code splitting and static generation. |
| **Prisma Client Generator** | ^5.10.0 | Generates type-safe database client from schema, ensuring type safety between database queries and application code. |

## Development Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| **tsx** | ^4.7.1 | TypeScript execution engine for development, allowing direct execution of TypeScript files without manual compilation step. |
| **dotenv** | ^16.4.5 | Environment variable management, loading configuration from .env files for secure credential handling. |

## Summary Statistics

- **Total Runtime Dependencies**: 8 packages
- **Total Development Dependencies**: 15 packages
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5.10.0
- **Testing Framework**: Jest 29.7.0
- **Containerization**: Docker + Docker Compose

## Dependency Management

All dependencies are managed through npm workspaces:
- Root `package.json` defines workspace structure
- `backend/package.json` manages backend dependencies
- `frontend/package.json` manages frontend dependencies
- `package-lock.json` ensures reproducible installs across all environments

## Security Considerations

- All dependencies are regularly updated to patch security vulnerabilities
- No unnecessary dependencies are included to minimize attack surface
- Credentials are never stored in code, only in environment variables
- Database credentials are not exposed in health check endpoints
- Docker images use non-root users for enhanced security
