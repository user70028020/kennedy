import { Router } from 'express';
import authRoutes from './auth.js';
import reportsRoutes from './reports.js';
import adminRoutes from './admin.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
router.use('/auth', authRoutes);

// Reports routes (protected by module middleware)
router.use('/reports', reportsRoutes);

// Admin routes (protected by auth + admin middleware)
router.use('/admin', adminRoutes);

export default router;
