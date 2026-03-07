import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors/AppError';
import Logger from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (err instanceof AppError) {
    if (!err.isOperational) {
      Logger.error(`Unexpected AppError: ${err.message}`, { stack: err.stack });
    }
    res.status(err.statusCode).json({
      status: false,
      statusCode: err.statusCode,
      message: err.message,
      ...(isDevelopment && { stack: err.stack }),
    });
  } else {
    Logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: 'Internal Server Error',
      ...(isDevelopment && { stack: err.stack, error: err.message }),
    });
  }
};

// Handle 404 Not Found Errors
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: 'Resource not found',
  });
};
