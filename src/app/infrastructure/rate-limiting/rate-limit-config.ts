import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

import { rateLimitSettings } from "@/app/config/rate-limit-config";

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  handler?: (req: any, res: any) => void;
}

export const defaultRateLimitConfig: RateLimitConfig = {
  windowMs: rateLimitSettings.global.windowMs,
  max: rateLimitSettings.global.max,
  message: rateLimitSettings.global.message,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export const strictRateLimitConfig: RateLimitConfig = {
  windowMs: rateLimitSettings.strict.windowMs,
  max: rateLimitSettings.strict.max,
  message: rateLimitSettings.strict.message,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export const authRateLimitConfig: RateLimitConfig = {
  windowMs: rateLimitSettings.auth.windowMs,
  max: rateLimitSettings.auth.max,
  message: rateLimitSettings.auth.message,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Skip successful auth requests
  skipFailedRequests: false,
};

// Custom key generator for more granular rate limiting
export const customKeyGenerator = (req: any): string => {
  // Use API key if available, otherwise fall back to IP
  return (
    req.headers["x-api-key"] ||
    req.ip ||
    req.connection.remoteAddress ||
    "unknown"
  );
};

// Custom handler for rate limit exceeded
export const customRateLimitHandler = (req: any, res: any): void => {
  res.status(StatusCodes.TOO_MANY_REQUESTS).json({
    error: "Too Many Requests",
    message: "Rate limit exceeded. Please try again later.",
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
  });
};

export function createRateLimiter(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: config.keyGenerator || customKeyGenerator,
    handler: config.handler || customRateLimitHandler,
  });
}

export function createDefaultRateLimiter() {
  return createRateLimiter(defaultRateLimitConfig);
}

export function createStrictRateLimiter() {
  return createRateLimiter(strictRateLimitConfig);
}

export function createAuthRateLimiter() {
  return createRateLimiter(authRateLimitConfig);
}
