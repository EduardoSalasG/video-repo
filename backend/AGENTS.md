# Backend Instructions

Applies to `backend/`.

Backend stack:

- Node.js
- Express
- Prisma
- PostgreSQL
- Zod
- JWT authentication
- Role-based access control

Roles:

- `STUDENT`
- `INSTRUCTOR`
- `ADMIN`

## Architecture

Typical request flow:

```text
route
→ middleware
→ controller
→ model / Prisma
→ database
```

Validation is handled with Zod schemas.

Authentication and role checks belong in the existing middleware layer.

## Rules

- Preserve existing route, middleware, controller, and model boundaries.
- Fix the earliest incorrect boundary, not merely where an error surfaces.
- Do not weaken Zod validation to make a request or test pass.
- Preserve authentication and authorization checks.
- Do not expose secrets, JWTs, passwords, or sensitive request data in logs.
- Do not modify Prisma schema or create migrations unless the schema is part of the requested change or proven root cause.
- Do not perform destructive database operations unless explicitly requested.
- Reuse existing models, validators, error handling, and API conventions.
- Do not duplicate data-access logic when an existing model helper already exists.

## Database

Local PostgreSQL is expected through the project Docker setup.

The development database is exposed on host port `5433`.

Use existing project scripts for database lifecycle.

## Debugging Context

For backend bugs, inspect only the relevant path through:

```text
request
→ route
→ middleware
→ controller
→ model / Prisma
→ database
```

For Prisma errors, use the exact Prisma diagnostic as evidence.

## Verification

```bash
npm run typecheck --workspace backend
npm run lint --workspace backend
npm test --workspace backend
npm run build --workspace backend
```

Use the narrowest relevant command first.