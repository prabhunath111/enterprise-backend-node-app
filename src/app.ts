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

// Rate limiting
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
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
});

export default app;