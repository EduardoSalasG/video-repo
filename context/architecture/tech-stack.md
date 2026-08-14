# Technology Stack

## Core Technologies

| Category | Technology | Version | Selection Date | ADR |
|----------|------------|---------|----------------|-----|
| Runtime | Node.js | 20.x LTS | [Date] | [ADR Link] |
| Language | TypeScript | 5.x | [Date] | [ADR Link] |
| Package Manager | npm | 10.x | [Date] | — |
| Build Tool | [Vite/esbuild/tsc] | [Version] | [Date] | [ADR Link] |
| Test Runner | Vitest | Latest | [Date] | [ADR Link] |
| Linter | ESLint | Latest | [Date] | — |
| Formatter | Prettier | Latest | [Date] | — |

## Framework & Libraries

| Purpose | Library | Version | Rationale |
|---------|---------|---------|-----------|
| Web Framework | [Express/Fastify/Hono] | [Version] | [Reason] |
| Validation | Zod | Latest | Type-safe schemas |
| Database ORM | [Prisma/Drizzle/TypeORM] | [Version] | [Reason] |
| Auth | [Library] | [Version] | [Reason] |
| Logging | [Pino/Winston] | [Version] | Structured logging |

## Development Tools

| Tool | Purpose |
|------|---------|
| TypeScript | Static type checking |
| ESLint | Code quality |
| Prettier | Code formatting |
| Vitest | Unit/integration testing |
| [Playwright/Cypress] | E2E testing |
| Husky | Git hooks |
| lint-staged | Pre-commit linting |

## Infrastructure

| Component | Technology |
|-----------|------------|
| Container | Docker |
| Orchestration | [Kubernetes/Docker Compose] |
| CI/CD | [GitHub Actions/GitLab CI] |
| Monitoring | [Prometheus/Grafana/Datadog] |
| Logging | [ELK/Loki] |