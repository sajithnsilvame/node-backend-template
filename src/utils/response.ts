import { Response } from 'express';

/**
 * Send a successful response with data payload.
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): void => {
  res.status(statusCode).json({
    status: true,
    ...(message && { message }),
    data,
  });
};

/**
 * Send a successful response with only a message (no data payload).
 */
export const messageResponse = (
  res: Response,
  message: string,
  statusCode = 200
): void => {
  res.status(statusCode).json({ status: true, message });
};
