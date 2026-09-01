# Contrato HTTP actual

Base local: `http://localhost:3000`. La fuente de rutas es `backend/src/app.ts` y `backend/src/routes/`. La colección importable está en [Postman](postman/video-repo.postman_collection.json).

## Autenticación

`POST /auth/register`, `POST /auth/login` y `POST /auth/magic-link` son públicas. Las demás rutas requieren autenticación mediante `Authorization: Bearer <token>` o la cookie que procesa el backend. La web usa el proxy de Next y debe mantener `video_repo_token` como cookie `httpOnly`.

Errores habituales: `400` entrada inválida, `401` sin autenticación, `403` sin permiso, `404` recurso ausente, `409` conflicto y `500` error no controlado. Los validadores Zod y pruebas especifican los cuerpos de error concretos.

## Rutas canónicas

| Grupo | Rutas |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/magic-link` |
| Cursos | `GET/POST /courses`, `GET/PATCH/DELETE /courses/:courseId` |
| Acceso a curso | `GET/POST /courses/:courseId/access`, `DELETE /courses/:courseId/access/:userId` |
| Módulos | `GET/POST /courses/:courseId/modules`, `GET/PATCH/DELETE /courses/:courseId/modules/:moduleId` |
| Secciones | `GET/POST /courses/:courseId/modules/:moduleId/sections`, `GET/PATCH/DELETE /courses/:courseId/modules/:moduleId/sections/:sectionId` |
| Vídeo | `GET/POST/PATCH/DELETE /courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata`, `POST .../upload-video` |
| Contenido | `GET/PATCH /courses/:courseId/modules/:moduleId/sections/:sectionId/content` |
| Progreso | `GET /progress`, `GET/POST/PATCH/DELETE /progress/:progressId`, `GET/PATCH /sections/:sectionId/progress`, `PATCH /sections/:sectionId/progress/complete` |
| Búsqueda | `GET /search` |
| Administración | `GET /admin/users`, `GET/PATCH /admin/users/:id`, `GET /admin/courses` |

Las escrituras de curso/módulo/sección/vídeo/contenido están protegidas por `authorizePolicy`; no sustituyas estas policies por una comprobación de UI. Las rutas de progreso se asocian al usuario autenticado.

## Compatibilidad y mantenimiento

`/modules` conserva los endpoints de compatibilidad `GET /modules` y `GET /modules/:moduleId` para navegación de módulos por usuario. No es la jerarquía de contenido principal. Un administrador puede consultarlos sin una fila explícita de acceso; los demás usuarios requieren acceso al curso del módulo.

Los endpoints de acceso por curso (`GET/POST /courses/:courseId/access` y `DELETE /courses/:courseId/access/:userId`) requieren respectivamente `READ` y `MAINTAIN`. Un usuario con `MAINTAIN` puede conceder, actualizar o revocar acceso; `READ` y `WRITE` reciben `403` para esas escrituras. Cualquier modificación de rutas, validadores, forma de respuesta, autorización o parámetros debe actualizar este archivo, los clientes afectados, pruebas y la colección Postman en el mismo cambio.

Las especificaciones bajo `docs/superpowers/` son históricas y pueden describir contratos anteriores.
