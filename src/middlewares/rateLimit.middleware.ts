import rateLimit from 'express-rate-limit';
import config from '../config/application.config';

export const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true, // Return rate limit info in the RateLimit-* headers
    legacyHeaders: false,  // Disable the X-RateLimit-* headers
    message: 'Too many requests from this IP, please try again later.',
});

// For sensitive routes (e.g., login), you might want a stricter rate limit:
export const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 200, // limit each IP to 20 requests per minute
    skipSuccessfulRequests: true, // Do not count successful requests
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login attempts from this IP, please try again after a minute.',
});

// For email verification to prevent brute force attacks
export const verificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 200, // limit each IP to 20 verification attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many verification attempts from this IP, please try again later.',
});