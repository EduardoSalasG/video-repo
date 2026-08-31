# AGENTS.md

## Propósito y contexto

`video-repo` es un monorepo npm para una plataforma de educación de baile: una API REST y una aplicación web que consumen el mismo modelo de cursos, módulos, secciones, vídeo y progreso. Antes de editar, identifica el flujo afectado, las capas involucradas y los contratos que pueden cambiar.

Las instrucciones de `frontend/AGENTS.md` y `backend/AGENTS.md` complementan esta guía y prevalecen para los archivos de sus respectivos directorios.

## Mapa del repositorio

- `backend/`: API Express, Prisma, PostgreSQL, Zod y autenticación JWT con control de acceso por rol.
- `frontend/`: Next.js 15 App Router, React 19, TypeScript y Tailwind; accede a la API mediante `/api/proxy/[...path]`.
- `backend/prisma/`: esquema, migraciones, generación de cliente y datos de semilla.
- `context/`: arquitectura, decisiones, convenciones y especificaciones del proyecto.
- `docs/`: contratos de API y esquema, además de diseños y planes históricos en `docs/superpowers/`.
- `.github/workflows/ci.yml`: validación continua para las ramas `main` y `develop`.

No añadas otro `AGENTS.md` salvo que una regla sea específica de un subárbol y no aplique al resto del repositorio.

## Comandos verificados

Ejecuta los comandos desde la raíz. Prefiere el workspace afectado antes de ampliar la verificación.

- Instalar dependencias: `npm install`
- Iniciar PostgreSQL local: `npm run db:start`
- Detener PostgreSQL local: `npm run db:stop`
- Iniciar backend: `npm run dev --workspace backend`
- Iniciar frontend: `npm run dev --workspace frontend`
- Preparar/aplicar migraciones: `npm run prisma:migrate --workspace backend`
- Generar cliente Prisma: `npm run prisma:generate --workspace backend`
- Build backend: `npm run build --workspace backend`
- Build frontend: `npm run build --workspace frontend`
- Verificación de un workspace: `npm run verify --workspace backend` o `npm run verify --workspace frontend`
- Verificación de todos los workspaces: `npm run verify`

Para un cambio acotado, ejecuta primero `typecheck`, `lint` y/o `test` del workspace afectado. No afirmes que una comprobación pasó si no se ejecutó y terminó correctamente.

## Flujo de trabajo

1. Lee el código, la documentación y los cambios locales relevantes antes de editar; busca antes de leer grandes porciones del repositorio.
2. Para cambios no triviales, define alcance, módulos afectados, riesgos, contratos, impacto en datos y documentación, y criterios de aceptación.
3. Implementa la menor unidad coherente; no mezcles refactors, limpieza ni cambios locales ajenos.
4. Actualiza pruebas, contratos y documentación cuando el cambio los afecte.
5. Revisa `git diff` y verifica la superficie afectada; amplía a build o verificación completa según el riesgo.
6. Comunica los comandos ejecutados, su resultado y cualquier brecha de verificación pendiente.

Usa los flujos de Superpowers para el proceso: `systematic-debugging` ante errores, fallos de pruebas o comportamiento inesperado; `verification-before-completion` antes de declarar un trabajo terminado.

## Reglas de implementación

- Sigue los patrones existentes y reutiliza tipos, esquemas, validadores y helpers canónicos antes de crear alternativas.
- Trata los diagnósticos de TypeScript como autoritativos. No uses `any`, `@ts-ignore` ni casts inseguros para silenciarlos.
- No inventes rutas, exports, aliases, APIs, esquemas ni convenciones: inspecciona primero el módulo y su configuración.
- No cambies configuración global de TypeScript o resolución de módulos para resolver un problema local sin haber probado que es la causa.

### API, autenticación y contratos

- Mantén los contratos, validación Zod, manejo de errores y tipos consistentes entre backend, proxy y frontend.
- El token `video_repo_token` es una cookie httpOnly: no lo expongas al JavaScript del cliente ni evites el proxy autenticado sin un patrón existente que lo justifique.
- Conserva autenticación y autorización; no las debilites para que pase una prueba o una solicitud.
- Si cambia un contrato público, actualiza `docs/api.md`, la colección `docs/postman/video-repo.postman_collection.json`, los helpers/clientes afectados y las pruebas pertinentes; evalúa compatibilidad antes de retirar una ruta o forma de respuesta.

### Datos y persistencia

- No modifiques el esquema Prisma ni crees migraciones salvo que formen parte del cambio solicitado o sean la causa demostrada.
- Todo cambio de esquema requiere una migración versionada y revisable; considera seeds, bootstrap, compatibilidad y recuperación de datos existentes.
- Todo incremento de esquema se entrega mediante migraciones Prisma versionadas; no uses `prisma db push` para entornos compartidos, CI o despliegues.
- El bootstrap del backend debe validar/aplicar migraciones y usar sólo seeds idempotentes; no asumas que este comportamiento existe sin verificarlo.
- No ejecutes operaciones destructivas de base de datos ni elimines datos sin autorización explícita.

### Interfaz

- Conserva las convenciones de App Router y los límites entre Server y Client Components.
- Mantén el sistema de diseño y los patrones de accesibilidad existentes; valida estados de carga, vacío, error y permisos cuando el flujo cambie.
- No combines cambios funcionales con una limpieza visual no relacionada.

## Entrega y Definition of Done

- Las aplicaciones o paquetes afectados compilan y pasan las verificaciones relevantes, o la brecha se declara explícitamente con su causa.
- Las pruebas, contratos, migraciones y documentación se actualizan cuando corresponde.
- Cada mejora, feature o cambio actualiza en el mismo diff la documentación afectada y, si toca la API, la colección Postman versionada.
- El diff fue revisado y no incluye secretos, archivos generados ni cambios ajenos.
- Para cambios dirigidos a `main`, sigue `context/conventions/git-workflow.md`: revisión, CI verde y squash merge.

## Mantenimiento de esta guía

- Mantén instrucciones breves, específicas del repositorio y comprobables con archivos o comandos reales.
- Enlaza a la documentación fuente en lugar de duplicar detalles que cambian con frecuencia.
- Actualiza o elimina una instrucción cuando se vuelva inexacta.
- Ante un error recurrente, prefiere automatizar su prevención con una prueba, lint, script o CI antes de añadir otra regla.
