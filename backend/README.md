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

Antes de escuchar HTTP, el backend espera PostgreSQL, ejecuta `prisma migrate deploy` y aplica el seed sólo si no existen usuarios ni cursos. El seed de usuarios, cursos y accesos es idempotente en ejecuciones secuenciales. Todavía no hay Compose; la validación del flujo dentro de la imagen y los comandos portables restantes están priorizados en el [roadmap de ingeniería](../docs/roadmaps/engineering.md).

Las reglas específicas están en [AGENTS.md](AGENTS.md).
