# Rate Limiting Implementation

This document describes the rate limiting implementation in the Express TypeScript service template, which uses `express-rate-limit` to protect the API from abuse and ensure fair usage.

## Overview

The rate limiting system is implemented following clean architecture principles with:

- **Infrastructure Layer**: Rate limiting middleware and services
- **Configuration**: Environment-based settings
- **Dependency Injection**: Service registration and resolution
- **Multiple Strategies**: Different rate limits for different endpoints

## Architecture

### Directory Structure

```
src/app/infrastructure/rate-limiting/
├── rate-limit-config.ts      # Configuration and factory functions
├── rate-limit-middleware.ts  # Middleware factory
└── rate-limit-service.ts     # Service interface and implementation

src/app/config/
└── rate-limit-config.ts      # Environment-based settings
```

### Components

#### 1. Rate Limit Configuration (`rate-limit-config.ts`)

Defines three types of rate limiters:

- **Global**: Applied to all routes (100 requests per 15 minutes)
- **Strict**: For sensitive operations (5 requests per 15 minutes)
- **Auth**: For authentication endpoints (10 requests per 15 minutes)

#### 2. Rate Limit Middleware (`rate-limit-middleware.ts`)

Factory class that creates rate limiting middleware instances with proper configuration.

#### 3. Rate Limit Service (`rate-limit-service.ts`)

Service interface and implementation that provides access to different rate limiters.

## Configuration

### Environment Variables

The rate limiting behavior can be configured using environment variables:

```bash
# Global rate limiting (applied to all routes)
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100          # 100 requests per window
RATE_LIMIT_MESSAGE="Too many requests from this IP, please try again later."

# Strict rate limiting (for sensitive operations)
RATE_LIMIT_STRICT_WINDOW_MS=900000   # 15 minutes in milliseconds
RATE_LIMIT_STRICT_MAX_REQUESTS=5     # 5 requests per window
RATE_LIMIT_STRICT_MESSAGE="Too many requests from this IP, please try again later."

# Auth rate limiting (for authentication endpoints)
RATE_LIMIT_AUTH_WINDOW_MS=900000     # 15 minutes in milliseconds
RATE_LIMIT_AUTH_MAX_REQUESTS=10      # 10 requests per window
RATE_LIMIT_AUTH_MESSAGE="Too many authentication attempts, please try again later."
```

### Default Values

If environment variables are not set, the following defaults are used:

- **Global**: 100 requests per 15 minutes
- **Strict**: 5 requests per 15 minutes
- **Auth**: 10 requests per 15 minutes

## Usage

### Global Rate Limiting

Applied automatically to all routes in the server setup:

```typescript
// In server.ts
const rateLimitService =
  this.container.resolve<RateLimitService>("rateLimitService");
this.app.use(rateLimitService.getGlobalLimiter());
```

### Route-Specific Rate Limiting

Different endpoints can use different rate limiting strategies:

```typescript
// In user-router.ts
// GET endpoints with strict rate limiting
userRouter.get("/", rateLimitService.getStrictLimiter(), (req, res) =>
  userController.getUsers(req, res),
);

// POST endpoints with auth rate limiting
userRouter.post("/", rateLimitService.getAuthLimiter(), (req, res) =>
  userController.createUser(req, res),
);
```

### Custom Rate Limiting

Create custom rate limiters for specific use cases:

```typescript
const customConfig: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  max: 5,
  message: "Custom rate limit exceeded",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
};

const customLimiter = rateLimitService.createCustomLimiter(customConfig);
```

## Features

### 1. Custom Key Generation

The rate limiting system supports custom key generation for more granular control:

```typescript
// Use API key if available, otherwise fall back to IP
const customKeyGenerator = (req: any): string => {
  return (
    req.headers["x-api-key"] ||
    req.ip ||
    req.connection.remoteAddress ||
    "unknown"
  );
};
```

### 2. Custom Error Handling

Custom error responses with retry information:

```typescript
const customRateLimitHandler = (req: any, res: any): void => {
  res.status(429).json({
    error: "Too Many Requests",
    message: "Rate limit exceeded. Please try again later.",
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
  });
};
```

### 3. Rate Limit Headers

The system includes standard rate limit headers in responses:

- `RateLimit-Limit`: Maximum requests allowed per window
- `RateLimit-Remaining`: Remaining requests in current window
- `RateLimit-Reset`: Time when the rate limit resets

## Testing

### Unit Tests

Unit tests verify the rate limiting service functionality:

```typescript
describe("ExpressRateLimitService", () => {
  it("should return rate limiter middleware", () => {
    const limiter = service.getGlobalLimiter();
    expect(limiter).toBeDefined();
    expect(typeof limiter).toBe("function");
  });
});
```

### E2E Tests

End-to-end tests verify rate limiting behavior in the actual application:

```typescript
describe("Rate Limiting E2E", () => {
  it("should apply global rate limiting to all endpoints", async () => {
    const requests = Array.from({ length: 105 }, () =>
      request(app).get("/api/v1/users"),
    );

    const responses = await Promise.all(requests);

    // First 100 requests should succeed
    for (let i = 0; i < 100; i++) {
      expect(responses[i].status).not.toBe(429);
    }

    // Requests after the limit should be rate limited
    for (let i = 100; i < 105; i++) {
      expect(responses[i].status).toBe(429);
    }
  });
});
```

## Best Practices

### 1. Health Check Exemption

Health check endpoints should not be rate limited to ensure monitoring systems can function:

```typescript
// Health check endpoint (no rate limiting)
this.app.use("/api/v1/health", healthRouter);
```

### 2. Different Limits for Different Operations

- **Read operations**: Use strict limits (5 requests per window)
- **Write operations**: Use auth limits (10 requests per window)
- **General operations**: Use global limits (100 requests per window)

### 3. Environment-Specific Configuration

Use different rate limits for different environments:

```bash
# Development
RATE_LIMIT_MAX_REQUESTS=1000

# Production
RATE_LIMIT_MAX_REQUESTS=100

# Testing
RATE_LIMIT_MAX_REQUESTS=10000
```

### 4. Monitoring and Logging

Monitor rate limiting events and adjust limits based on usage patterns:

```typescript
// Custom handler with logging
const customRateLimitHandler = (req: any, res: any): void => {
  logger.warn("Rate limit exceeded", {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    endpoint: req.path,
  });

  res.status(429).json({
    error: "Too Many Requests",
    message: "Rate limit exceeded. Please try again later.",
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
  });
};
```

## Security Considerations

### 1. IP Address Handling

The system properly handles different IP address scenarios:

- Real IP addresses
- Proxy-forwarded IPs
- IPv4 and IPv6 addresses

### 2. Rate Limit Bypass Prevention

- Use custom key generators for API key-based rate limiting
- Implement additional security measures for sensitive endpoints
- Monitor for unusual traffic patterns

### 3. DDoS Protection

While rate limiting helps with basic abuse prevention, consider additional measures for DDoS protection:

- CDN-based rate limiting
- Web Application Firewalls (WAF)
- Load balancing with rate limiting

## Troubleshooting

### Common Issues

1. **Rate limits too strict**: Adjust environment variables
2. **Health checks failing**: Ensure health endpoints are exempt
3. **Inconsistent behavior**: Check for proxy configuration issues

### Debugging

Enable debug logging to troubleshoot rate limiting issues:

```typescript
// Add to rate limit configuration
const debugConfig = {
  ...defaultConfig,
  handler: (req: any, res: any) => {
    console.log("Rate limit exceeded:", {
      ip: req.ip,
      path: req.path,
      headers: req.headers,
    });
    // ... rest of handler
  },
};
```

## Future Enhancements

### 1. Redis Store

For production deployments, consider using Redis for rate limiting storage:

```typescript
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

const redis = new Redis();
const store = new RedisStore({
  client: redis,
  prefix: "rate-limit:",
});

const limiter = rateLimit({
  store,
  // ... other config
});
```

### 2. Dynamic Rate Limiting

Implement dynamic rate limiting based on user tiers or subscription levels.

### 3. Rate Limit Analytics

Add analytics to track rate limiting events and optimize limits based on usage patterns.
