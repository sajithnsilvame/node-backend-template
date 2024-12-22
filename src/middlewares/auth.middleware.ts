import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { verifyToken } from '../utils/jwt';
import { AuthRepository } from '../repositories/auth.repository';

const authRepository = new AuthRepository();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export const Authenticated = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized Access Denied' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Check if token is valid in the database
    const isValidSession = await authRepository.isTokenValid(token);
    if (!isValidSession) {
      res.status(401).json({ message: 'Session expired or invalid' });
      return;
    }

    const decoded = verifyToken(token) as { id: number };
    if (!decoded || typeof decoded !== 'object') {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};