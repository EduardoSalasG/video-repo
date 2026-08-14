---
paths:
  - "src/api/**/*.ts"
---

# API Design Rules

## REST Conventions
- Resource-based URLs: `/api/v1/users`, `/api/v1/users/:id`
- Plural nouns for collections
- HTTP methods: GET, POST, PUT, PATCH, DELETE
- Version in URL: `/v1/`, `/v2/`

## Request/Response
- camelCase for JSON properties
- Standard error format:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
  ```
- Pagination: `?page=1&limit=20` with `Link` header
- Include `requestId` in response headers

## Validation
- Validate all inputs at API boundary
- Use Zod schemas for request validation
- Return 400 for validation errors with details

## Security
- Auth required for all mutating endpoints
- Rate limiting on all endpoints
- CORS configured for known origins only
- Helmet.js for security headers

## Documentation
- OpenAPI/Swagger comments on all handlers
- Example requests/responses