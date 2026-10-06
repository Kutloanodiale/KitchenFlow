import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', router);

// Health check with diagnostics
app.get('/api/health', async (req, res) => {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'unknown',
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    const { default: prisma } = await import('./lib/prisma');
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.database = 'connected';
    
    // Get database info (safe, no secrets)
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as database_user,
        version() as database_version
    `;
    healthcheck.databaseInfo = dbInfo[0];
    
    res.json(healthcheck);
  } catch (error) {
    healthcheck.status = 'error';
    healthcheck.database = 'disconnected';
    healthcheck.error = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(healthcheck);
  }
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;
