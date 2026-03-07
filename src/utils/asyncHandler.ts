import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an async route handler and forwards any thrown errors to Express's next(error).
 * Eliminates the need for try-catch boilerplate in every controller method.
 *
 * Usage in routes:
 *   router.post('/register', asyncHandler(controller.register.bind(controller)));
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
