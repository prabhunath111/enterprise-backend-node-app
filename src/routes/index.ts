import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';

const router = Router();

// Routes
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;