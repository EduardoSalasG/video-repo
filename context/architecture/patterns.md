# Patrones y convenciones actuales

- **Capas de backend:** ruta → middleware → controlador → modelo/servicio → Prisma.
- **Proxy/BFF ligero:** route handlers de Next reenvían peticiones autenticadas a Express.
- **Validación en frontera:** Zod valida entradas HTTP.
- **Autorización por policy:** la policy usa el recurso padre de la jerarquía de contenido.
- **Borrado lógico:** currículo y progreso usan `isDeleted`/`deletedAt`; las consultas deben respetarlos.
- **Upsert:** acceso por curso y progreso tienen claves compuestas que permiten operaciones idempotentes por usuario y recurso.

## Evolución propuesta

Introducir puertos/adaptadores y casos de uso sólo donde aporte valor, empezando por acceso a cursos y progreso. Los contextos candidatos son Identidad y Acceso, Currículo, Progreso de aprendizaje y Medios. No etiquetar el código como DDD o hexagonal hasta implementar y probar esos límites.
