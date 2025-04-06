import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors/AppError';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Check if the error is an instance of AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      ...(isDevelopment && { stack: err.stack }), // Include stack trace in development mode
    });
  } else {
    console.error(err.stack); // Log the stack trace for debugging

    // For unexpected errors
    res.status(500).json({
      status: 'error',
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
