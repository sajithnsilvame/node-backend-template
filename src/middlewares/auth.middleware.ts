import { Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { verifyToken } from '../utils/jwt';
import { AuthRepository } from '../repositories/auth.repository';
import Role from '../models/role.model';
import { AuthenticatedRequest } from '../types';
import Logger from '../utils/logger';

const authRepository = new AuthRepository();

export const Authenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: false, message: 'Unauthorized Access Denied', statusCode: 401, code: '001-401' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const isValidSession = await authRepository.isTokenValid(token);
    if (!isValidSession) {
      res.status(401).json({ status: false, message: 'Session expired or invalid', statusCode: 401, code: '002-401' });
      return;
    }

    const decoded = verifyToken(token) as { id: number };
    if (!decoded || typeof decoded !== 'object') {
      res.status(401).json({ status: false, message: 'Invalid token', statusCode: 401, code: '003-401' });
      return;
    }

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, attributes: ['id', 'role_name'] }],
    });
    if (!user) {
      res.status(401).json({ status: false, message: 'User Not Found', statusCode: 401, code: '004-401' });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      roleName: user.Role?.role_name ?? '',
    };

    next();
  } catch (error) {
    Logger.error('Authentication Error:', { error });
    res.status(401).json({ status: false, message: 'Authentication failed' });
  }
};