# Visión del proyecto

`video-repo` es una plataforma web de educación de baile. Ofrece autenticación, catálogo de cursos, gestión de módulos/secciones/vídeo, permisos por curso y seguimiento de progreso.

Lee primero [AGENTS.md](../../AGENTS.md), después [Sistema actual](../architecture/current-system.md), [API](../../docs/api.md) y [esquema](../../docs/schema.md). Los documentos bajo `docs/superpowers/` son históricos.

## Directorios clave

| Directorio | Responsabilidad |
|---|---|
| `frontend/` | Aplicación Next.js y pruebas de interfaz |
| `backend/` | API Express, Prisma, validadores y pruebas |
| `backend/prisma/` | Esquema, migraciones y seed |
| `context/` | Arquitectura, convenciones y decisiones vigentes |
| `docs/` | Contratos, esquema, Postman y roadmaps |

## Arranque local actual

```powershell
npm install
npm run db:start
npm run prisma:migrate --workspace backend
npm run seed --workspace backend
npm run dev --workspace backend
npm run dev --workspace frontend
```

Los scripts `db:*` actuales usan `docker run`; Docker Compose y la inicialización automática de esquema/seed son trabajo pendiente del roadmap, no capacidades actuales.
