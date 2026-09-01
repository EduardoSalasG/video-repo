# video-repo

Monorepo de una plataforma de educación de baile. Incluye una API Express/Prisma/PostgreSQL y una aplicación web Next.js.

## Estado actual

- La navegación de contenido es `Curso → Módulo → Sección → vídeo/contenido`.
- El frontend usa `/courses` como flujo principal y un proxy autenticado de Next hacia el backend.
- El backend tiene Dockerfile, pero aún no Docker Compose ni bootstrap automático de migraciones/seed.
- El seed de usuarios, cursos y accesos es idempotente en ejecuciones secuenciales; el bootstrap automático de migraciones y seed sigue priorizado en el [roadmap de ingeniería](docs/roadmaps/engineering.md).

Arquitectura y riesgos actuales: [context/architecture/current-system.md](context/architecture/current-system.md). Contratos: [API](docs/api.md), [esquema](docs/schema.md) y [colección Postman](docs/postman/video-repo.postman_collection.json).

## Desarrollo local actual

```powershell
npm install
npm run db:start
npm run prisma:migrate --workspace backend
npm run seed --workspace backend
npm run dev --workspace backend
npm run dev --workspace frontend
```

Abre `http://localhost:3001`. El PostgreSQL local usa el puerto de host `5433`. Los comandos `db:*` aún dependen de Docker y de una ruta local configurada en el script; su sustitución por comandos portables basados en Compose está en el roadmap.

## Verificación

```powershell
npm run verify --workspace backend
npm run verify --workspace frontend
npm run build --workspace backend
npm run build --workspace frontend
```

Lee [AGENTS.md](AGENTS.md) antes de modificar el repositorio. Todo cambio debe actualizar la documentación afectada y todo cambio de API debe actualizar también la colección Postman.
