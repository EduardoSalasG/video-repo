---
paths:
  - "**/*"
---

# Security Rules

## Secrets Management
- No secrets in code, config, or logs
- Use environment variables for secrets
- `.env` files in `.gitignore`
- Rotate secrets regularly

## Input Validation
- Validate all external inputs at boundaries
- Sanitize user-generated content
- Use parameterized queries (no string concatenation)
- Limit request payload size

## Authentication & Authorization
- JWT tokens with short expiry
- Refresh token rotation
- Role-based access control (RBAC)
- Session invalidation on password change

## Data Protection
- Encrypt PII at rest
- TLS 1.2+ for all connections
- No sensitive data in URLs or logs
- Secure cookie flags (HttpOnly, Secure, SameSite)

## Dependencies
- Scan for vulnerabilities: `npm audit`
- Pin dependency versions
- Review new dependencies before adding
- Use `npm audit fix` for non-breaking fixes

## Logging & Monitoring
- No secrets in logs
- Structured logging (JSON)
- Audit log for sensitive operations
- Alert on security events