# Multi-stage build for KitchenFlow

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/

# Install all dependencies (npm workspaces)
RUN npm ci

# Stage 2: Build application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY . .

# Generate Prisma client
WORKDIR /app/backend
RUN npx prisma generate

# Build backend
RUN npm run build

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy backend
COPY --from=builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/backend/package.json ./backend/
COPY --from=builder --chown=nextjs:nodejs /app/backend/prisma ./backend/prisma

# Copy frontend
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./frontend/.next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

# Copy root package files
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Create startup script
RUN echo '#!/bin/sh\n\
cd /app/backend\n\
echo "Running database migrations..."\n\
npx prisma db push --skip-generate\n\
echo "Starting KitchenFlow..."\n\
cd /app\n\
cd backend && node dist/server.js &\n\
cd /app/frontend && node server.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Switch to non-root user
USER nextjs

# Expose ports
EXPOSE 3000
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init as init system
ENTRYPOINT ["dumb-init", "--"]

# Start both services
CMD ["/app/start.sh"]
