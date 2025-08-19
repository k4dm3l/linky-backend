import { beforeEach, describe, expect, it } from "vitest";

import { RateLimitConfig } from "@/app/infrastructure/rate-limiting/rate-limit-config";
import { ExpressRateLimitService } from "@/app/infrastructure/rate-limiting/rate-limit-service";

describe("ExpressRateLimitService", () => {
  let service: ExpressRateLimitService;

  beforeEach(() => {
    service = new ExpressRateLimitService();
  });

  describe("getGlobalLimiter", () => {
    it("should return a rate limiter middleware", () => {
      const limiter = service.getGlobalLimiter();
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe("function");
    });
  });

  describe("getStrictLimiter", () => {
    it("should return a strict rate limiter middleware", () => {
      const limiter = service.getStrictLimiter();
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe("function");
    });
  });

  describe("getAuthLimiter", () => {
    it("should return an auth rate limiter middleware", () => {
      const limiter = service.getAuthLimiter();
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe("function");
    });
  });

  describe("createCustomLimiter", () => {
    it("should create a custom rate limiter with provided config", () => {
      const customConfig: RateLimitConfig = {
        windowMs: 60_000, // 1 minute
        max: 5,
        message: "Custom rate limit exceeded",
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        skipFailedRequests: false,
      };

      const limiter = service.createCustomLimiter(customConfig);
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe("function");
    });

    it("should handle config with custom key generator", () => {
      const customConfig: RateLimitConfig = {
        windowMs: 60_000,
        max: 10,
        message: "Custom rate limit exceeded",
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: req => req.headers["x-api-key"] || req.ip,
      };

      const limiter = service.createCustomLimiter(customConfig);
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe("function");
    });
  });
});
