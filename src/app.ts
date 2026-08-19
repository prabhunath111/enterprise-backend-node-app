import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/error.middleware';
import routes from './routes';
import logger from './utils/logger';

const app = express();

// Connect to database
connectDatabase();

// ============= FIX: Enable Trust Proxy =============
// Render uses a proxy, so we need to trust it
// This must be set BEFORE the rate limiter
app.set('trust proxy', true);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: env.corsOrigin.split(','),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
}

// ============= FIX: Configure Rate Limiter =============
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health check
  skip: (req) => req.path === '/health',
  // Disable validation checks that cause issues with proxy
  validate: false, // This disables all validation checks
});

app.use('/api', limiter);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = env.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${env.nodeEnv}`);
  logger.info(`Trust proxy: ${app.get('trust proxy')}`);
});

export default app;