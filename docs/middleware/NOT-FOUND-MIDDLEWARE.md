# Not Found Middleware

> **Note:** All API endpoints are versioned. The version is configurable via the `API_VERSION` environment variable (default: `v1`).

The Not Found Middleware is a crucial component that handles all requests that don't match any defined routes in the application. It provides a consistent and informative 404 response for unmatched routes.

## Overview

This middleware is designed to:

- Catch all unmatched routes
- Provide consistent error responses
- Include helpful debugging information
- Handle edge cases properly

## Implementation

### Location

`src/app/infrastructure/middleware/not-found-middleware.ts`

### Key Features

1. **Headers Check**: Only processes requests if headers haven't been sent yet
2. **Consistent Response Format**: Returns a standardized error response structure
3. **Debugging Information**: Includes timestamp, path, and method for troubleshooting
4. **Error Code**: Provides a specific error code for programmatic handling

## Response Format

```json
{
  "error": "Not Found",
  "message": "Route GET /api/nonexistent not found",
  "errorCode": "ROUTE_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/nonexistent",
  "method": "GET"
}
```

### Response Fields

| Field       | Type   | Description                                          |
| ----------- | ------ | ---------------------------------------------------- |
| `error`     | string | Always "Not Found"                                   |
| `message`   | string | Human-readable description with HTTP method and path |
| `errorCode` | string | Programmatic error code: "ROUTE_NOT_FOUND"           |
| `timestamp` | string | ISO 8601 timestamp of when the error occurred        |
| `path`      | string | The original request path                            |
| `method`    | string | The HTTP method used                                 |

## Usage

### Server Integration

The middleware is automatically integrated into the server setup in `src/app/server.ts`:

```typescript
private setupRoutes(): void {
  // ... other routes ...

  // 404 handler - must be last after all routes
  this.app.use(notFoundMiddleware);
}
```

### Important Notes

1. **Order Matters**: This middleware must be registered **after** all other routes
2. **Headers Check**: Respects if headers have already been sent by other middleware
3. **Universal Coverage**: Catches all HTTP methods (GET, POST, PUT, DELETE, etc.)

## Testing

### Unit Tests

Location: `tests/unit/app/infrastructure/middleware/not-found-middleware.test.ts`

Tests cover:

- 404 status code response
- Proper error response structure
- Timestamp validation
- Different HTTP methods
- Complex URLs with query parameters
- Headers sent edge case
- Root path and empty path handling

### E2E Tests

Location: `tests/e2e/not-found.test.ts`

Tests cover:

- Real server integration
- Various HTTP methods
- Different URL patterns
- Query parameters
- Nested routes

## Examples

### Basic 404 Response

```bash
GET /api/nonexistent
```

Response:

```json
{
  "error": "Not Found",
  "message": "Route GET /api/nonexistent not found",
  "errorCode": "ROUTE_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/nonexistent",
  "method": "GET"
}
```

### Complex URL with Query Parameters

```bash
PUT /api/v1/users/123?include=profile&fields=name,email
```

Response:

```json
{
  "error": "Not Found",
  "message": "Route PUT /api/v1/users/123?include=profile&fields=name,email not found",
  "errorCode": "ROUTE_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/123?include=profile&fields=name,email",
  "method": "PUT"
}
```

## Error Handling

### Headers Already Sent

If headers have already been sent by previous middleware, the not found middleware will:

- Call `next()` to pass control to the next middleware
- Not attempt to send a response
- Not interfere with existing response flow

### Edge Cases Handled

- Empty paths
- Root path (`/`)
- Complex query parameters
- All HTTP methods
- Special characters in URLs

## Best Practices

1. **Always Last**: Register this middleware after all other routes
2. **Consistent Format**: Maintain the same response structure across all 404 responses
3. **Debugging Info**: Include sufficient information for troubleshooting
4. **Error Codes**: Use specific error codes for programmatic handling
5. **Timestamps**: Include timestamps for logging and debugging

## Integration with Architecture

This middleware fits into the clean architecture pattern by:

- Being part of the infrastructure layer
- Not having dependencies on domain or application layers
- Providing a consistent interface for error handling
- Following the single responsibility principle

## Monitoring and Logging

The middleware provides rich information for monitoring:

- **Error Code**: Can be used for alerting and metrics
- **Timestamp**: Useful for correlation with logs
- **Path and Method**: Helps identify patterns in 404 requests
- **Consistent Format**: Enables automated parsing and analysis
