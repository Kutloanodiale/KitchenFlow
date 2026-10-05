# Third-Party Dependencies

## Runtime Dependencies

### Backend

| Package           | Purpose                                                                 |
|-------------------|-------------------------------------------------------------------------|
| @prisma/client    | Type-safe database client for querying PostgreSQL via Prisma ORM        |
| express           | Web framework for building the REST API server                          |
| cors              | Middleware to enable Cross-Origin Resource Sharing for frontend requests|
| dotenv            | Loads environment variables from .env file for configuration            |
| zod               | TypeScript-first schema validation for request body validation          |

### Frontend

| Package    | Purpose                                                          |
|------------|------------------------------------------------------------------|
| next       | React framework with App Router for server-side rendering and routing |
| react      | UI library for building component-based user interfaces          |
| react-dom  | Renders React components into the DOM                           |

## Development Dependencies

### Backend

| Package            | Purpose                                                        |
|--------------------|----------------------------------------------------------------|
| prisma             | ORM toolkit for schema management, migrations, and code generation |
| typescript         | TypeScript compiler for type checking and transpilation        |
| tsx                | TypeScript execution engine for running TypeScript files directly |
| jest               | JavaScript testing framework for unit and integration tests    |
| ts-jest            | Jest transformer for TypeScript test files                     |
| supertest          | HTTP assertion library for testing Express API endpoints       |
| @types/*           | TypeScript type definitions for Node, Express, Jest, CORS, Supertest |

### Frontend

| Package            | Purpose                                                        |
|--------------------|----------------------------------------------------------------|
| typescript         | TypeScript compiler for type checking                          |
| @types/node        | TypeScript type definitions for Node.js                        |
| @types/react       | TypeScript type definitions for React                          |
| @types/react-dom   | TypeScript type definitions for React DOM                      |

### Root (Monorepo)

| Package       | Purpose                                                        |
|---------------|----------------------------------------------------------------|
| concurrently  | Runs multiple npm scripts concurrently for development         |
