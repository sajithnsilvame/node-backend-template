import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    roleId: number;
    roleName: string;
  };
}

export const canAccess = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.roleName; // Get the user's role name from the request object

    if (!userRole || !allowedRoles.includes(userRole)) {
      // If the user doesn't have the required role, send a 403 Forbidden response
      res.status(403).json({
        status: false,
        message: 'Access denied. You do not have the required role.',
        statusCode: 403,
        code: '001-403',
      });
      return; // Stop further processing
    }

    // If the user has the required role, call next() to pass control to the next middleware
    next();
  };
};