import { RequestHandler } from "express";

import {
  createAuthRateLimiter,
  createDefaultRateLimiter,
  createStrictRateLimiter,
  customKeyGenerator,
  customRateLimitHandler,
  RateLimitConfig,
} from "./rate-limit-config";

export interface RateLimitMiddleware {
  global: RequestHandler;
  strict: RequestHandler;
  auth: RequestHandler;
  custom: (config: RateLimitConfig) => RequestHandler;
}

export const RateLimitMiddlewareFactory = {
  create(): RateLimitMiddleware {
    return {
      global: createDefaultRateLimiter(),
      strict: createStrictRateLimiter(),
      auth: createAuthRateLimiter(),
      custom: (config: RateLimitConfig) => {
        const rateLimit = require("express-rate-limit");
        return rateLimit({
          ...config,
          keyGenerator: config.keyGenerator || customKeyGenerator,
          handler: config.handler || customRateLimitHandler,
        });
      },
    };
  },
};
