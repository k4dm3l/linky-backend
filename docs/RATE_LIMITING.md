# Rate Limiting Implementation

This document explains the rate limiting implementation in the project, which follows clean architecture principles and provides flexible, configurable rate limiting for the API.

## 🏗️ Architecture Overview

The rate limiting implementation is structured in the **Infrastructure Layer** following clean architecture principles:

```
src/app/infrastructure/rate-limiting/
├── rate-limit-config.ts      # Configuration and factory functions
├── rate-limit-middleware.ts  # Middleware factory
└── rate-limit-service.ts     # Service interface and implementation
```

## 📁 File Structure

### 1. **Configuration** (`rate-limit-config.ts`)

- Defines rate limiting configurations
- Environment-specific settings
- Factory functions for creating limiters

### 2. **Middleware Factory** (`rate-limit-middleware.ts`)

- Creates different types of rate limiters
- Provides interface for rate limiting middleware
- Abstracts the express-rate-limit implementation

### 3. **Service** (`rate-limit-service.ts`)

- Implements the RateLimitService interface
- Provides dependency injection support
- Manages rate limiting middleware instances

## 🔧 Configuration

### Environment Variables

The rate limiting can be configured through environment variables:

```bash
# Global rate limiting
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes (default)
RATE_LIMIT_MAX_REQUESTS=100        # 100 requests per window (default)
RATE_LIMIT_MESSAGE="Too many requests from this IP, please try again later."

# Strict rate limiting
RATE_LIMIT_STRICT_WINDOW_MS=900000 # 15 minutes (default)
RATE_LIMIT_STRICT_MAX_REQUESTS=5   # 5 requests per window (default)
RATE_LIMIT_STRICT_MESSAGE="Too many requests from this IP, please try again later."

# Authentication rate limiting
RATE_LIMIT_AUTH_WINDOW_MS=900000   # 15 minutes (default)
RATE_LIMIT_AUTH_MAX_REQUESTS=10    # 10 requests per window (default)
RATE_LIMIT_AUTH_MESSAGE="Too many authentication attempts, please try again later."
```

### Default Configurations

```typescript
// Global rate limiting (applied to all routes)
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,    // Return rate limit info in headers
  legacyHeaders: false,     // Disable legacy headers
}

// Strict rate limiting (for sensitive endpoints)
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // 5 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}

// Authentication rate limiting
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 requests per window
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Skip successful auth requests
}
```

## 🚀 Usage

### 1. **Global Rate Limiting**

Applied to all routes by default:

```typescript
// In src/app/server.ts
private setupMiddleware(): void {
  const rateLimitService = this.container.resolve<RateLimitService>("rateLimitService");

  // Global rate limiting for all routes
  this.app.use(rateLimitService.getGlobalLimiter());
}
```

### 2. **Route-Specific Rate Limiting**

Apply different rate limits to specific routes:

```typescript
// Strict rate limiting for sensitive endpoints
this.app.use("/api/v1/auth", rateLimitService.getAuthLimiter());

// Custom rate limiting for specific routes
const customConfig: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  max: 10,
  message: "Custom rate limit message",
  standardHeaders: true,
  legacyHeaders: false,
};
this.app.use(
  "/api/v1/sensitive",
  rateLimitService.createCustomLimiter(customConfig),
);
```

### 3. **Excluding Routes from Rate Limiting**

To exclude health checks or other critical endpoints:

```typescript
// Health check endpoint (no rate limiting)
this.app.use("/api/v1/health", healthRouter);

// User endpoints with rate limiting
this.app.use("/api/v1/users", userRouter);
```

## 📊 Response Headers

The rate limiting middleware adds the following headers to responses:

- `RateLimit-Limit`: Maximum requests allowed per window
- `RateLimit-Remaining`: Remaining requests in current window
- `RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## 🔍 Testing

### Unit Tests

```typescript
// tests/unit/app/infrastructure/rate-limiting/rate-limit-service.test.ts
describe("ExpressRateLimitService", () => {
  it("should create global rate limiter", () => {
    const globalLimiter = rateLimitService.getGlobalLimiter();
    expect(globalLimiter).toBeDefined();
    expect(typeof globalLimiter).toBe("function");
  });
});
```

### E2E Tests

```typescript
// tests/e2e/rate-limiting.test.ts
describe("Rate Limiting E2E", () => {
  it("should return rate limit headers", async () => {
    const response = await request(server.getHttpServer())
      .get("/api/v1/users")
      .expect(StatusCodes.OK);

    expect(response.headers).toHaveProperty("ratelimit-limit");
    expect(response.headers).toHaveProperty("ratelimit-remaining");
    expect(response.headers).toHaveProperty("ratelimit-reset");
  });
});
```

## 🔧 Dependency Injection

The rate limiting service is registered in the DI container:

```typescript
// src/app/di/setup.ts
export function setupContainer(): Container {
  const container = new Container();

  // Register infrastructure services
  container.registerSingleton(
    "rateLimitService",
    () => new ExpressRateLimitService(),
  );

  return container;
}
```

## 🛡️ Security Benefits

### 1. **DDoS Protection**

- Prevents overwhelming the server with requests
- Protects against brute force attacks
- Reduces server load during traffic spikes

### 2. **API Abuse Prevention**

- Limits automated scraping
- Prevents API abuse by malicious users
- Protects against credential stuffing attacks

### 3. **Resource Management**

- Ensures fair usage of API resources
- Prevents single users from monopolizing the service
- Maintains service quality for all users

## 🔄 Customization

### Creating Custom Rate Limiters

```typescript
const customConfig: RateLimitConfig = {
  windowMs: 30000, // 30 seconds
  max: 20, // 20 requests per 30 seconds
  message: "Custom rate limit exceeded",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: true, // Skip failed requests
};

const customLimiter = rateLimitService.createCustomLimiter(customConfig);
this.app.use("/api/v1/custom", customLimiter);
```

### Environment-Specific Configuration

```typescript
// Development environment
RATE_LIMIT_MAX_REQUESTS = 1000; // More lenient for development

// Production environment
RATE_LIMIT_MAX_REQUESTS = 100; // Stricter for production

// Testing environment
RATE_LIMIT_MAX_REQUESTS = 10000; // Very lenient for testing
```

## 📈 Monitoring

### Rate Limit Headers

Monitor rate limiting through response headers:

```bash
curl -I http://localhost:3000/api/v1/users

# Response headers:
# RateLimit-Limit: 100
# RateLimit-Remaining: 99
# RateLimit-Reset: 1640995200
```

### Logging

Rate limiting events can be logged for monitoring:

```typescript
// Custom rate limiter with logging
const rateLimiterWithLogging = rateLimit({
  ...defaultRateLimitConfig,
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      userAgent: req.get("User-Agent"),
    });
    res.status(429).json({
      error: "Too many requests",
      errorCode: "RATE_LIMIT_EXCEEDED",
    });
  },
});
```

## 🚀 Best Practices

### 1. **Gradual Implementation**

- Start with lenient limits in development
- Gradually tighten limits based on usage patterns
- Monitor and adjust based on real-world usage

### 2. **Different Limits for Different Endpoints**

- Stricter limits for authentication endpoints
- More lenient limits for read-only endpoints
- Custom limits for resource-intensive operations

### 3. **User-Friendly Messages**

- Provide clear, actionable error messages
- Include information about when limits reset
- Consider providing alternative endpoints or methods

### 4. **Monitoring and Alerting**

- Monitor rate limit violations
- Set up alerts for unusual patterns
- Track rate limiting impact on user experience

## 🔮 Future Enhancements

### 1. **Redis Store**

- Replace in-memory store with Redis for distributed deployments
- Enable rate limiting across multiple server instances
- Provide better persistence and scalability

### 2. **User-Based Rate Limiting**

- Implement rate limiting based on user authentication
- Different limits for different user tiers
- Premium user benefits with higher limits

### 3. **Dynamic Rate Limiting**

- Adjust limits based on server load
- Implement adaptive rate limiting
- Provide different limits during peak hours

### 4. **Rate Limit Analytics**

- Track rate limiting patterns
- Provide insights into API usage
- Identify potential abuse patterns

This implementation provides a solid foundation for rate limiting that can be easily extended and customized based on your specific needs.
