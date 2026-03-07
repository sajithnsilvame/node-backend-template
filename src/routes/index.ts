import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoleRoutes from './roles.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/user-role', userRoleRoutes);

export default router;
