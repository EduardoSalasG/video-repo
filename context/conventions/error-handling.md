# Error Handling Patterns

## Error Types

### AppError (Base)
```typescript
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### Domain Errors (4xx)
- `VALIDATION_ERROR` — Invalid input (400)
- `NOT_FOUND` — Resource not found (404)
- `UNAUTHORIZED` — Auth required (401)
- `FORBIDDEN` — Insufficient permissions (403)
- `CONFLICT` — Resource conflict (409)

### System Errors (5xx)
- `INTERNAL_ERROR` — Unexpected error (500)
- `SERVICE_UNAVAILABLE` — Dependency down (503)
- `TIMEOUT` — Operation timed out (504)

## Handling Patterns

### Async Functions
```typescript
async function getUser(id: string): Promise<Result<User, AppError>> {
  try {
    const user = await userRepository.findById(id);
    if (!user) return err(new NotFoundError('User not found'));
    return ok(user);
  } catch (error) {
    return err(new InternalError('Failed to get user', { cause: error }));
  }
}
```

### Error Boundaries
- Catch at API layer, convert to HTTP response
- Log with context (requestId, userId, operation)
- Never expose stack traces to clients
- Include error code for client handling

### Retry Logic
- Exponential backoff for transient failures
- Max 3 retries
- Circuit breaker for external services
- Idempotency keys for mutating operations

## Logging
- Structured JSON logs
- Levels: error, warn, info, debug
- Include: timestamp, level, message, requestId, context
- No PII in logs
- Error logs include: code, message, stack (dev only)