# KitchenFlow

Restaurant Operations & Order Management System built with Next.js, TypeScript, Prisma, and Supabase.

## Features

- Order management with lifecycle tracking
- Kitchen station routing and preparation monitoring
- Menu management with categories
- Inventory and recipe management
- Real-time delay detection
- Analytics dashboard
- Order history retention

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for production database)
- Docker (optional, for containerized deployment)

## Installation

```bash
# Clone repository
git clone <repository-url>
cd KitchenFlow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Initialize database
npm run db:push

# Start development servers
npm run dev
```

## Development

```bash
# Start both frontend and backend
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend
```

## Testing

```bash
npm test
```

## Database

```bash
# Run migrations
npm run db:migrate

# Push schema changes
npm run db:push

# Open Prisma Studio
npm run db:studio
```

## Documentation

- [README.md](./README.md) - Project overview
- [DATABASE.md](./DATABASE.md) - Database schema documentation
- [THIRD-PARTY.md](./THIRD-PARTY.md) - Third-party dependencies
- [DOCKER.md](./DOCKER.md) - Docker deployment guide
- [AI-USAGE.md](./AI-USAGE.md) - AI assistance declaration

## Environment Variables

See `.env.example` for required environment variables.

## License

MIT
