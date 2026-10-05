# Docker Deployment Guide

## Overview

KitchenFlow can be deployed using Docker and Docker Compose. This guide covers containerized production deployment with PostgreSQL.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd KitchenFlow
```

### 2. Start the Application

Run the following command to build and start all services:

```bash
docker compose up --build
```

This command:
- Builds the application Docker image
- Pulls the PostgreSQL 16 image
- Creates a named volume for database persistence
- Starts both application and database containers
- Waits for database to be healthy before starting the application
- Runs database migrations automatically

### 3. Access the Application

Once the containers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/api/health

### 4. Stop the Application

```bash
docker compose down
```

To stop and remove the database volume (⚠️ **this deletes all data**):

```bash
docker compose down -v
```

## Architecture

### Services

#### Application Service (`app`)
- **Image**: Built from `Dockerfile`
- **Ports**: 
  - 3000 (Frontend)
  - 4000 (Backend API)
- **Environment**:
  - `NODE_ENV=production`
  - `DATABASE_URL` configured to connect to `db` service
- **Depends on**: `db` service with `service_healthy` condition
- **User**: Runs as non-root user (`nextjs:nodejs`)

#### Database Service (`db`)
- **Image**: `postgres:16-alpine`
- **Port**: Not published (internal network only)
- **Environment**:
  - `POSTGRES_DB=kitchenflow`
  - `POSTGRES_USER=kitchenflow`
  - `POSTGRES_PASSWORD=kitchenflow_secret`
- **Volume**: `kitchenflow-data` for persistent storage
- **Healthcheck**: Uses `pg_isready` to verify database is ready

### Network

Both services communicate over a private Docker network (`kitchenflow-network`). The database is not accessible from the host machine, only from the application container.

### Volumes

- **kitchenflow-data**: Persistent PostgreSQL data volume
  - Survives container recreation
  - Located at `/var/lib/postgresql/data` in the database container
  - Created automatically on first run

## Configuration

### Environment Variables

The application uses the following environment variables (configured in `compose.yml`):

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `DATABASE_URL` | `postgresql://kitchenflow:kitchenflow_secret@db:5432/kitchenflow` | PostgreSQL connection string |
| `BACKEND_PORT` | `4000` | Backend API port |
| `PORT` | `3000` | Frontend port |

### Changing Credentials

To change database credentials:

1. Edit `compose.yml`:

```yaml
services:
  app:
    environment:
      DATABASE_URL: postgresql://<user>:<password>@db:5432/<database>
  
  db:
    environment:
      POSTGRES_DB: <database>
      POSTGRES_USER: <user>
      POSTGRES_PASSWORD: <password>
```

2. Remove the existing volume (⚠️ **this deletes all data**):

```bash
docker compose down -v
```

3. Restart the application:

```bash
docker compose up -d
```

## Database Migrations

Database migrations are run automatically when the application starts. The startup script executes:

```bash
npx prisma db push --skip-generate
```

This ensures the database schema is up-to-date before the application starts.

### Manual Migration

To run migrations manually:

```bash
docker compose exec app sh -c "cd backend && npx prisma db push"
```

## Viewing Logs

### All Services

```bash
docker compose logs -f
```

### Specific Service

```bash
# Application logs
docker compose logs -f app

# Database logs
docker compose logs -f db
```

## Health Checks

### Application Health

The application has a health check that verifies the backend API is responding:

```bash
docker compose ps
```

Look for `healthy` in the STATUS column.

### Database Health

The database uses `pg_isready` for health checks:

```bash
docker compose exec db pg_isready -U kitchenflow -d kitchenflow
```

## Data Persistence

### Database Data

Database data is stored in the `kitchenflow-data` named volume. This volume persists across container restarts and recreations.

To backup the database:

```bash
docker compose exec db pg_dump -U kitchenflow kitchenflow > backup.sql
```

To restore from backup:

```bash
cat backup.sql | docker compose exec -T db psql -U kitchenflow kitchenflow
```

### Viewing Volume Information

```bash
docker volume ls | grep kitchenflow
```

## Troubleshooting

### Application Won't Start

**Problem**: Application container exits immediately

**Solution**: Check logs for errors:

```bash
docker compose logs app
```

Common issues:
- Database not ready: Check `docker compose logs db` for database health
- Port already in use: Change port mapping in `compose.yml`
- Missing environment variables: Verify `compose.yml` configuration

### Database Connection Errors

**Problem**: Application cannot connect to database

**Solution**: 
1. Verify database is healthy: `docker compose ps`
2. Check DATABASE_URL uses `db` as host (not `localhost`)
3. Ensure both services are on the same network

### Port Already in Use

**Problem**: Port 3000 or 4000 is already in use

**Solution**: Change port mapping in `compose.yml`:

```yaml
ports:
  - "8080:3000"  # Map host port 8080 to container port 3000
  - "8081:4000"  # Map host port 8081 to container port 4000
```

### Database Volume Issues

**Problem**: Database starts with old data or schema conflicts

**Solution**: Remove the volume and restart (⚠️ **this deletes all data**):

```bash
docker compose down -v
docker compose up -d
```

## Production Considerations

### Security

1. **Change default credentials** in `compose.yml`
2. **Use environment files** for sensitive data:
   ```yaml
   env_file:
     - .env.production
   ```
3. **Don't commit** `.env` files to version control
4. **Use secrets management** for production deployments

### Performance

1. **Resource limits**: Add resource constraints to services:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```

2. **Connection pooling**: Consider adding PgBouncer for high-traffic deployments

### Monitoring

1. **Health checks**: Already configured for both services
2. **Logging**: Use centralized logging (ELK, Loki, etc.)
3. **Metrics**: Consider adding Prometheus + Grafana

## Development with Docker

For development with hot-reload, use the local development setup instead:

```bash
npm install
npm run dev
```

See [README.md](README.md) for development setup instructions.

## Docker Compose Commands Reference

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Build and start all services |
| `docker compose up -d` | Start services in background |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop and remove containers + volumes |
| `docker compose logs -f` | Follow logs from all services |
| `docker compose ps` | Show container status |
| `docker compose restart` | Restart all services |
| `docker compose exec app sh` | Open shell in application container |
| `docker compose exec db psql` | Open PostgreSQL shell |

## Support

For issues related to:
- **Application logic**: See [README.md](README.md)
- **Database schema**: See [DATABASE.md](DATABASE.md)
- **Testing**: See [TESTING.md](TESTING.md)
