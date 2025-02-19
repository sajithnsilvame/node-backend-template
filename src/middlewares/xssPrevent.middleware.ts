import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
import he from 'he'; 

export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // First, sanitize the input
        let sanitized = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {},
        });
        // Optionally, encode the sanitized content
        req.body[key] = he.encode(sanitized);
      }
    }
  }
  next();
};