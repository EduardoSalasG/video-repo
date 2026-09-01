# Sistema actual

_Estado observado en el árbol de trabajo, 31 de agosto de 2026. Describe la implementación actual, no la arquitectura objetivo._

`video-repo` es un monorepo npm para educación de baile. Gestiona cursos, módulos, secciones, metadatos de vídeo y progreso.

## Componentes

```mermaid
flowchart LR
  B[Browser] --> N[Frontend: Next.js 15\nApp Router]
  N --> X[Auth handlers y\n/api/proxy/[...path]]
  X --> E[Backend: Express 5]
  E --> M[Middleware\nauth + policies + Zod]
  M --> C[Controllers]
  C --> S[Models / services]
  S --> P[Prisma]
  P --> D[(PostgreSQL)]
  E --> V[Vídeos locales]
```

- `frontend/`: Next.js 15, React 19, TypeScript y Tailwind. La navegación primaria es `/courses`; `/library` es legado/compatibilidad.
- `backend/`: API REST Express con capas ruta → middleware → controller → modelo/servicio → Prisma.
- `backend/prisma/schema.prisma`: esquema PostgreSQL.
- `docker-compose.yml` orquesta PostgreSQL, backend y frontend. PostgreSQL usa un volumen nombrado; el frontend usa la URL pública para el navegador y `BACKEND_INTERNAL_URL` para el proxy server-side.

## Modelo y acceso

```mermaid
erDiagram
  USER ||--o{ SESSION : creates
  USER ||--o{ USER_PROGRESS : records
  USER ||--o{ COURSE_USER_ACCESS : receives
  COURSE ||--o{ COURSE_USER_ACCESS : grants
  COURSE ||--o{ MODULE : contains
  MODULE ||--o{ SECTION : contains
  SECTION ||--o| VIDEO_METADATA : has
  SECTION ||--o{ USER_PROGRESS : tracks
```

La jerarquía canónica es `Course → Module → Section → VideoMetadata`. Los roles globales son `ADMIN`, `INSTRUCTOR` y `STUDENT`; por curso se asignan `READ`, `WRITE` y `MAINTAIN`. Currículo y progreso usan borrado lógico; `CourseUserAccess` no.

## Seguridad y flujo HTTP

El backend acepta cookie o Bearer. El flujo web previsto conserva `video_repo_token` como cookie `httpOnly`; el proxy de Next la convierte en Bearer para Express, sin exponerla al JavaScript del navegador.

```mermaid
sequenceDiagram
  participant U as Usuario
  participant N as Next.js
  participant E as Express
  participant DB as PostgreSQL
  U->>N: Petición protegida
  N->>E: Bearer derivado de cookie httpOnly
  E->>DB: autenticar, autorizar y consultar
  DB-->>E: resultado
  E-->>N: JSON
  N-->>U: respuesta
```

Las rutas y contratos operativos están en [docs/api.md](../../docs/api.md).

## Deuda y objetivo inmediato

- No es una arquitectura hexagonal ni DDD formal: es una arquitectura en capas. La evolución debe ser incremental, empezando por acceso y progreso.
- El seed reutiliza usuarios, cursos activos y accesos existentes, por lo que es idempotente en ejecuciones secuenciales. Aún no tiene una restricción única de base de datos para nombres de curso ni resuelve carreras de escrituras concurrentes.
- No hay CI activa; al reintroducirla debe usar `prisma migrate deploy`, nunca `prisma db push`.
- El arranque espera PostgreSQL, ejecuta `prisma migrate deploy` y usa el seed idempotente sólo cuando no hay usuarios ni cursos. Falta validarlo dentro de Compose y cubrir la garantía de concurrencia del seed.
- La colección Postman versionada vive en `docs/postman/` y debe evolucionar junto a cada cambio de API.

`docs/superpowers/` conserva diseños y planes históricos; no es contrato vigente.
