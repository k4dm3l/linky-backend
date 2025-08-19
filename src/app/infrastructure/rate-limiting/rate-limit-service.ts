import { RateLimitMiddleware, RateLimitMiddlewareFactory } from "./rate-limit-middleware";
import { RateLimitConfig } from "./rate-limit-config";

export interface RateLimitService {
  getGlobalLimiter(): ReturnType<typeof RateLimitMiddlewareFactory.create>["global"];
  getStrictLimiter(): ReturnType<typeof RateLimitMiddlewareFactory.create>["strict"];
  getAuthLimiter(): ReturnType<typeof RateLimitMiddlewareFactory.create>["auth"];
  createCustomLimiter(config: RateLimitConfig): ReturnType<typeof RateLimitMiddlewareFactory.create>["global"];
}

export class ExpressRateLimitService implements RateLimitService {
  private middleware: RateLimitMiddleware;

  constructor() {
    this.middleware = RateLimitMiddlewareFactory.create();
  }

  getGlobalLimiter() {
    return this.middleware.global;
  }

  getStrictLimiter() {
    return this.middleware.strict;
  }

  getAuthLimiter() {
    return this.middleware.auth;
  }

  createCustomLimiter(config: RateLimitConfig) {
    return this.middleware.custom(config);
  }
} 