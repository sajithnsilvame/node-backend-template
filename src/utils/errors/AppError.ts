export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace (only in V8 engines, e.g., Node.js)
    Error.captureStackTrace(this, this.constructor);
  }
}
