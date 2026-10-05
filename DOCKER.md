# Docker Documentation

## Overview

KitchenFlow uses Docker to containerize the application for consistent deployment. The setup includes a multi-stage Dockerfile for optimized production images and a Docker Compose configuration for orchestrating the application with Supabase PostgreSQL.

## Architecture

Since KitchenFlow uses Supabase as the managed PostgreSQL database, the Docker setup focuses on containerizing the application itself. The database runs on Supabase's cloud infrastructure.

## Dockerfile

The Dockerfile uses a multi-stage build to create an optimized production image:

1. **Dependencies stage:** Installs all dependencies using `npm ci` for reproducible builds.
2. **Build stage:** Compiles the TypeScript code and builds the Next.js application.
3. **Production stage:** Contains only the necessary runtime files, reducing image size.

Key features:
- Uses Node.js 20 LTS as the base image.
- Runs as a non-root user for security.
- Uses `npm ci` for deterministic dependency installation.
- Excludes development dependencies from the final image.
- Does not copy `.env` files with real credentials into the image.

## Docker Compose

The `compose.yml` file defines the application service:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    ports:
      - "3000:3000"
    depends_on:
      - db-healthcheck
    restart: unless-stopped

  db-healthcheck:
    image: postgres:16
    command: ["pg_isready", "-h", "${DB_HOST}", "-p", "5432", "-U", "${DB_USER}"]
    environment:
      PGPASSWORD: ${DB_PASSWORD}
```

**Note:** Since Supabase manages the PostgreSQL database, the Docker Compose setup primarily containerizes the application. A healthcheck service verifies database connectivity.

## Network Relationship

The application connects to Supabase PostgreSQL over the public internet using the `DATABASE_URL` environment variable. The connection string uses Supabase's hostname (not localhost).

## Environment Variables

| Variable      | Description                          | Required |
|---------------|--------------------------------------|----------|
| DATABASE_URL  | Supabase PostgreSQL connection string| Yes      |
| NODE_ENV      | Environment (production/development) | Yes      |
| PORT          | Application port (default: 3000)     | No       |
| BACKEND_PORT  | Backend API port (default: 4000)     | No       |

**Important:** Never commit real credentials to Git. Use `.env.example` as a template and provide actual values through environment variables or a local `.env` file (which is gitignored).

## Commands

### Build the image

```bash
docker compose build
```

### Start the application

```bash
docker compose up -d
```

### View logs

```bash
docker compose logs -f
```

### Stop the application

```bash
docker compose down
```

### Restart the application

```bash
docker compose restart
```

### Verify configuration

```bash
docker compose config
```

## Troubleshooting

### Application cannot connect to database

- Verify `DATABASE_URL` is correctly set in your environment.
- Check that Supabase project is active and accessible.
- Ensure network connectivity to Supabase hosts.

### Port already in use

- Change the port mapping in `compose.yml` or stop the conflicting service.
- Example: Change `"3000:3000"` to `"3001:3000"`.

### Build fails

- Ensure Docker is running and you have sufficient permissions.
- Clear Docker cache: `docker system prune -a`.
- Check that all required files are present and `.dockerignore` is not excluding necessary files.

### Health check fails

- Verify Supabase database is operational.
- Check that the healthcheck endpoint `/api/health` returns a success response.
- Review application logs for database connection errors.
