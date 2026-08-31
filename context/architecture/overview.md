# Visión general de arquitectura

La fuente de verdad del estado implementado es [Sistema actual](current-system.md). `video-repo` separa una aplicación Next.js de una API Express que persiste currículo y progreso con Prisma/PostgreSQL.

La frontera pública es HTTP. El frontend usa un proxy de Next para preservar la cookie `httpOnly`. El dominio de contenido se organiza como `Course → Module → Section → VideoMetadata`; el acceso combina roles globales y permisos por curso.

No hay objetivos cuantificados de rendimiento, disponibilidad u observabilidad. Tampoco se afirma arquitectura hexagonal o DDD como estado actual; son una evolución propuesta en el roadmap de ingeniería.
