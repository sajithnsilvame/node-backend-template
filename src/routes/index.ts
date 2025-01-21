import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoleRoutes from './roles.routes';

const router = Router();


// Use Auth routes
router.use('/auth', authRoutes);
router.use('/user-role', userRoleRoutes);

export default router;
