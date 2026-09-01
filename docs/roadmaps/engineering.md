# Roadmap de ingeniería

_Prioridades técnicas para llevar el estado actual a una plataforma operable. No declara que los puntos pendientes ya estén implementados._

## E0 — Estabilización y contrato canónico

1. Corregir las pruebas unitarias obsoletas y mantener verde la verificación por workspace antes de ampliar el sistema.
2. Consolidar rutas canónicas anidadas bajo `/courses/:courseId/...`; retirar las rutas o helpers heredados mediante transición compatible.
3. Unificar el contrato de autenticación cookie/proxy/Bearer y añadir pruebas de autorización por recurso y de borrado lógico.
4. Mantener `docs/api.md`, `docs/schema.md` y `docs/postman/video-repo.postman_collection.json` en cada cambio de contrato.

**Salida:** contratos comprobables, suite relevante verde y ninguna ruta heredada como flujo principal.

## E1 — Base de datos reproducible e idempotente

1. Adoptar migraciones Prisma versionadas como única vía de incremento de esquema. Sustituir `prisma db push` en CI y procedimientos compartidos por `prisma migrate deploy` (producción/CI) y `prisma migrate dev` (desarrollo).
2. Hecho: el seed reutiliza cursos activos por nombre y usa `upsert` para usuarios y accesos, evitando duplicados en corridas secuenciales. Pendiente: separar datos de desarrollo de datos mínimos de bootstrap y decidir una garantía ante ejecuciones concurrentes.
3. Definir y probar el bootstrap del backend: esperar la disponibilidad de PostgreSQL, inspeccionar el estado de migraciones, aplicar las pendientes y ejecutar seed **sólo** si la base está vacía. El proceso debe fallar con diagnóstico y código no cero ante migración/seed inválidos, no arrancar contra un esquema desconocido.
4. Añadir pruebas de integración que ejecuten bootstrap dos veces y prueben: misma cardinalidad, mismas claves de negocio y conservación de datos existentes.

**Salida:** una base nueva y una base ya inicializada terminan en el mismo estado de esquema/datos semilla, sin operaciones destructivas implícitas.

## E2 — Dockerización y comandos operables

1. Crear `docker-compose.yml` para PostgreSQL, backend y frontend, con healthchecks, dependencias de arranque, volúmenes nombrados y configuración por `.env`/`.env.example` sin secretos versionados.
2. Integrar el bootstrap de E1 en el servicio backend; documentar claramente qué corre en cada inicio y cómo diagnosticar fallos.
3. Reemplazar los scripts dependientes de una ruta Windows fija por comandos portables: `npm run stack:up`, `stack:down`, `stack:logs`, `stack:build`, `db:migrate` y `db:seed`.
4. Verificar arranque limpio, reinicio con volumen existente, actualización con migración nueva y apagado sin borrar datos. Cualquier borrado de volumen queda como comando explícito y autorizado.

**Salida:** `npm run stack:up` deja frontend, backend y PostgreSQL utilizables desde un clon nuevo, y puede repetirse sin duplicar seed ni romper el esquema.

## E3 — Evolución arquitectónica incremental

1. Delimitar contextos: Identidad y Acceso, Currículo, Progreso de aprendizaje y Medios.
2. Extraer casos de uso y puertos primero en acceso a cursos y progreso; Express y Prisma pasan a ser adaptadores en esos límites.
3. Añadir pruebas de contrato para los puertos. No migrar a NestJS ni realizar una reescritura total sin una decisión arquitectónica y métricas de dolor que la justifiquen.

## E4 — Operabilidad y calidad continua

- Migraciones en CI, pruebas de contrato/E2E, observabilidad, configuración segura por entorno y estrategia de backups/restore.
- Incorporar métricas sólo con objetivos de producto definidos.

## Regla transversal

Cada mejora, feature o cambio actualiza documentación. Cualquier cambio de API actualiza además la colección Postman versionada y una prueba de contrato o integración proporcional al riesgo.
