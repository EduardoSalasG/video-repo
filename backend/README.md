# Backend

API REST Express para cursos, módulos, secciones, vídeo, progreso y permisos por curso. La ruta de una petición es `route → middleware → controller → model/service → Prisma`.

## Comandos

Ejecutar desde la raíz:

```powershell
npm run dev --workspace backend
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run seed --workspace backend
npm run verify --workspace backend
npm run build --workspace backend
```

La base local se inicia con `npm run db:start` y se expone en `localhost:5433`. Consulta [API](../docs/api.md) y [esquema](../docs/schema.md) antes de cambiar una ruta o persistencia.

## Estado operativo

Hay un Dockerfile para el backend. Todavía no hay Compose, el backend no aplica migraciones automáticamente al iniciar y el seed no es idempotente para cursos. Las correcciones y los comandos portables están priorizados en el [roadmap de ingeniería](../docs/roadmaps/engineering.md).

Las reglas específicas están en [AGENTS.md](AGENTS.md).
