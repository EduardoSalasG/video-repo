# Flujo de datos

El diagrama de componentes está en [Sistema actual](current-system.md).

## Lectura de currículo

1. La página de Next obtiene la sesión en el servidor.
2. El proxy toma `video_repo_token` de la cookie y crea el Bearer hacia Express.
3. Express autentica, evalúa la policy del curso, módulo o sección y consulta Prisma.
4. El JSON vuelve por el proxy a la página o componente.

## Escritura de progreso

Las rutas por sección usan el usuario autenticado y no un `userId` provisto por el cliente. `UserProgress` tiene unicidad compuesta por usuario y sección, por lo que la operación puede expresarse como upsert.

Zod valida entrada y las policies cortan la petición antes de los controladores. Los códigos y contratos públicos están en [docs/api.md](../../docs/api.md).
