import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();


// Use Auth routes
router.use('/auth', authRoutes);

export default router;
