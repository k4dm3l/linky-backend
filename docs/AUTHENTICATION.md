# Authentication Implementation

> **Note:** All API endpoints are versioned. The version is configurable via the `API_VERSION` environment variable (default: `v1`).

This document describes the Passport JWT authentication implementation in the Express TypeScript service template, which provides secure user authentication and authorization.

## Overview

The authentication system is implemented following clean architecture principles with:

- **Domain Layer**: Value objects, entities, and domain services
- **Application Layer**: Use cases, DTOs, and results
- **Infrastructure Layer**: Passport configuration, middleware, and repositories
- **API Layer**: Controllers and routers
- **Dependency Injection**: Service registration and resolution

## Architecture

### Directory Structure

```
src/contexts/auth/
├── domain/
│   ├── entities/
│   │   └── user-credentials.ts
│   ├── repositories/
│   │   └── user-credentials-repository.ts
│   ├── services/
│   │   └── auth-domain-service.ts
│   └── value-objects/
│       ├── jwt-token.ts
│       └── password.ts
├── application/
│   ├── dtos/
│   │   ├── register-user-dto.ts
│   │   ├── login-dto.ts
│   │   └── change-password-dto.ts
│   ├── results/
│   │   └── auth-result.ts
│   └── use-cases/
│       ├── register-user-use-case.ts
│       ├── login-use-case.ts
│       └── change-password-use-case.ts
├── infrastructure/
│   └── repositories/
│       └── in-memory-user-credentials-repository.ts
└── api/
    ├── auth-controller.ts
    └── auth-router.ts

src/app/infrastructure/passport/
├── passport-config.ts
└── auth-middleware.ts
```

### Components

#### 1. Domain Layer

**Value Objects:**

- `Password`: Handles password validation, hashing, and comparison
- `JwtToken`: Encapsulates JWT token logic and validation

**Entities:**

- `UserCredentials`: Represents user authentication data

**Domain Services:**

- `AuthDomainService`: Handles business logic for authentication

#### 2. Application Layer

**Use Cases:**

- `RegisterUserUseCase`: Handles user registration
- `LoginUseCase`: Handles user authentication and JWT generation
- `ChangePasswordUseCase`: Handles password changes

**DTOs:**

- Request/response data transfer objects for API communication

#### 3. Infrastructure Layer

**Passport Configuration:**

- JWT strategy configuration
- User authentication logic

**Middleware:**

- JWT authentication middleware
- Optional authentication middleware

## Configuration

### Environment Variables

The authentication behavior can be configured using environment variables:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Rate Limiting for Auth Endpoints
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX_REQUESTS=10
RATE_LIMIT_AUTH_MESSAGE="Too many authentication attempts, please try again later."
```

### Default Values

If environment variables are not set, the following defaults are used:

- **JWT_SECRET**: "your-secret-key" (⚠️ Change in production!)
- **JWT_EXPIRES_IN**: "24h"
- **Auth Rate Limit**: 10 requests per 15 minutes

## API Endpoints

### Authentication Endpoints

#### 1. Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "profileImage": "https://example.com/avatar.jpg",
  "isActive": true,
  "isVerified": true,
  "role": "USER",
  "plan": "STANDARD"
}
```

**Response:**

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "profileImage": "https://example.com/avatar.jpg",
  "isActive": true,
  "isVerified": true,
  "role": "USER",
  "plan": "STANDARD",
  "message": "User registered successfully"
}
```

**Optional Fields:**

- `profileImage`: URL to user's profile image (optional, defaults to null)
- `isActive`: Whether the user account is active (optional, defaults to true)
- `isVerified`: Whether the user email is verified (optional, defaults to true)
- `role`: User role - "ADMIN" or "USER" (optional, defaults to "USER")
- `plan`: User plan - "STANDARD" or "PREMIUM" (optional, defaults to "STANDARD")

#### 2. Login User

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

#### 3. Change Password (Authenticated)

```http
POST /api/v1/auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

**Response:**

```json
{
  "message": "Password changed successfully"
}
```

#### 4. Get Profile (Authenticated)

```http
GET /api/v1/auth/profile
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "userId": "8863cd95-7e6f-4788-8bd0-367d7e5bcbbb",
  "email": "camilo@test.com",
  "name": "Camilo Acevedo",
  "profileImage": null,
  "isActive": true,
  "isVerified": true,
  "role": "USER",
  "plan": "STANDARD",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## Usage

### 1. Protecting Routes

Use the `authenticateJwt` middleware to protect routes:

```typescript
import { authenticateJwt } from "@/app/infrastructure/passport/auth-middleware";

// Protected route
router.get("/protected", authenticateJwt, (req, res) => {
  // req.user contains the authenticated user
  const { userId, email } = req.user;
  res.json({ message: "Protected data", userId, email });
});
```

### 2. Optional Authentication

Use `optionalAuthenticateJwt` for routes that work with or without authentication:

```typescript
import { optionalAuthenticateJwt } from "@/app/infrastructure/passport/auth-middleware";

// Optional authentication
router.get("/public", optionalAuthenticateJwt, (req, res) => {
  if (req.user) {
    // User is authenticated
    res.json({ message: "Hello authenticated user", userId: req.user.userId });
  } else {
    // User is not authenticated
    res.json({ message: "Hello guest" });
  }
});
```

### 3. Custom Authentication Logic

Extend the authentication logic in the Passport configuration:

```typescript
// In passport-config.ts
const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
    ignoreExpiration: false,
  },
  async (payload, done) => {
    try {
      // Custom authentication logic
      const user = await userService.findById(payload.userId);

      if (!user || !user.isActive) {
        return done(null, false, { message: "User not found or inactive" });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  },
);
```

## Security Features

### 1. Password Security

- **Hashing**: Passwords are hashed using bcrypt with salt rounds of 12
- **Validation**: Strong password requirements (uppercase, lowercase, numbers, 8-128 chars)
- **Comparison**: Secure password comparison using bcrypt

### 2. JWT Security

- **Secret Key**: Configurable JWT secret (change in production!)
- **Expiration**: Configurable token expiration
- **Payload**: Minimal payload with userId and email
- **Bearer Token**: Standard Authorization header format

### 3. Rate Limiting

- **Auth Endpoints**: Stricter rate limiting for authentication endpoints
- **Global Protection**: All endpoints protected by global rate limiting
- **Configurable**: Rate limits configurable via environment variables

### 4. Input Validation

- **Email Validation**: Proper email format validation
- **Password Validation**: Strong password requirements
- **Request Validation**: Comprehensive input validation in use cases

## Testing

### Unit Tests

```typescript
// tests/unit/contexts/auth/domain/value-objects/password.test.ts
describe("Password", () => {
  it("should create a password with valid input", () => {
    const password = Password.create("ValidPass123");
    expect(password.getHashedValue()).toBeDefined();
    expect(password.compare("ValidPass123")).toBe(true);
  });
});
```

### Integration Tests

```typescript
// tests/e2e/authentication.test.ts
describe("Authentication E2E", () => {
  it("should register and login user", async () => {
    // Register user
    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "test@example.com",
        password: "SecurePass123",
        name: "Test User",
      });

    expect(registerResponse.status).toBe(201);

    // Login user
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "test@example.com",
      password: "SecurePass123",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
  });
});
```

## Error Handling

### Common Error Responses

#### 1. Validation Errors

```json
{
  "error": "Invalid email format",
  "errorCode": "INVALID_EMAIL"
}
```

#### 2. Authentication Errors

```json
{
  "error": "Invalid email or password",
  "errorCode": "AUTHENTICATION_FAILED"
}
```

#### 3. Authorization Errors

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

#### 4. Rate Limiting Errors

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 900
}
```

## Best Practices

### 1. Security

- **Change JWT Secret**: Always change the default JWT secret in production
- **Use HTTPS**: Always use HTTPS in production
- **Token Expiration**: Set appropriate token expiration times
- **Password Policy**: Enforce strong password policies

### 2. Performance

- **Token Size**: Keep JWT payload minimal
- **Caching**: Consider caching user data for frequently accessed information
- **Database**: Use proper indexing for user lookups

### 3. Monitoring

- **Logging**: Log authentication events for security monitoring
- **Metrics**: Track authentication success/failure rates
- **Alerts**: Set up alerts for unusual authentication patterns

### 4. Development

- **Environment Variables**: Use different secrets for different environments
- **Testing**: Comprehensive testing of authentication flows
- **Documentation**: Keep API documentation up to date

## Future Enhancements

### 1. Additional Authentication Methods

- **OAuth**: Google, GitHub, etc.
- **Two-Factor Authentication**: TOTP, SMS
- **Social Login**: Facebook, Twitter, etc.

### 2. Advanced Security

- **Refresh Tokens**: Implement refresh token rotation
- **Token Blacklisting**: Blacklist revoked tokens
- **Device Management**: Track and manage device sessions

### 3. User Management

- **Password Reset**: Email-based password reset
- **Account Lockout**: Temporary account lockout after failed attempts
- **Session Management**: User session management

### 4. Analytics

- **Login Analytics**: Track login patterns and locations
- **Security Events**: Monitor and alert on security events
- **User Behavior**: Analyze user authentication behavior

This implementation provides a solid foundation for authentication that can be easily extended and customized based on your specific needs.
