# Stack tecnológico

| Área | Implementación observada |
|---|---|
| Runtime | Node.js, TypeScript y npm workspaces |
| Frontend | Next.js 15, React 19, Tailwind CSS, Zod, Vitest y Testing Library |
| Backend | Express 5, Prisma, PostgreSQL, Zod, JWT, cookie-parser, CORS, Multer y FFmpeg |
| Persistencia | PostgreSQL 16 local y Prisma Client con adaptador `pg` |
| Calidad | TypeScript, ESLint, Prettier y Vitest |
| CI | No hay workflow activo; se definirá antes de promover cambios a `main` |
| Contenedores | Dockerfile de backend y scripts `db:*` basados en `docker run`; sin Compose aún |

Las versiones exactas están en los `package.json`. No hay evidencia de monitorización, E2E, hooks de Git u orquestación Kubernetes.
