# Roadmap de producto

_Priorizado, no comprometido. Se revisa al validar cada hito._

## P0 — Experiencia base estable

- Consolidar navegación `Cursos → Módulos → Secciones` y eliminar superficies heredadas cuando exista migración compatible.
- Asegurar inicio de sesión, permisos visibles y mensajes de error/carga/vacío coherentes.
- Confirmar que un estudiante sólo ve contenido al que tiene acceso y puede retomar su progreso.

**Salida:** recorrido estudiante autenticado, desde el catálogo hasta una sección, sin rutas duplicadas ni exposición de token.

## P1 — Aprendizaje y autoría

- Reproductor de vídeo, contenido Markdown, posición de reproducción y completar sección.
- Gestión por instructores/administradores de cursos, módulos, secciones, metadatos y carga de vídeo.
- Administración de acceso `READ`/`WRITE`/`MAINTAIN` por curso.

**Salida:** un instructor puede publicar contenido y dar acceso; un estudiante puede consumirlo y retomar su avance.

## P2 — Descubrimiento y operación

- Búsqueda por texto, estilo, dificultad, tipo y curso.
- Vistas administrativas de usuarios y cursos con controles de permisos.
- Evidencia funcional para escritorio y móvil, accesibilidad básica y estados no felices.

## P3 — Confiabilidad de producto

- Notificaciones y flujo de magic-link realmente entregable.
- Analítica de uso y aprendizaje, privacidad y retención de datos.
- Validar necesidades de colaboración, pagos, reporting o distribución de vídeo antes de construirlas.

## Regla de entrega

Toda feature actualiza en el mismo cambio su documentación de comportamiento y, si tiene superficie HTTP, [la colección Postman](../postman/video-repo.postman_collection.json).
