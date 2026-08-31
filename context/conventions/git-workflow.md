# Flujo de Git

## Ramas

```text
feature/<agent>-<task>-<descripción>
  → develop
  → main
```

- `develop` es la rama de integración.
- `main` contiene sólo versiones revisadas, verificadas y promocionadas desde `develop`.
- Las ramas de trabajo nacen de `develop` y tienen formato `<agent>/<task-id>-<short-description>` o `feature/<agent>-<task>-<description>` cuando ya exista esa convención en la rama.
- Un hotfix nace de `main`, vuelve a `main` y se regulariza en `develop` de inmediato.

## Commits

Formato: `[<agent>] <type>: <mensaje en imperativo y conciso>`.

Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`.

Ejemplos:

```text
[implementer] fix: align progress controller tests
[coordinator] docs: document current architecture
[tester] test: cover idempotent database bootstrap
```

Cada commit debe ser una unidad coherente y comprobable. No mezclar cambios locales ajenos ni archivos generados.

## Promoción

1. La rama de feature abre PR hacia `develop`.
2. La PR incluye resumen, pruebas ejecutadas, documentación/colección Postman cuando correspondan y una revisión independiente.
3. CI debe estar verde; se realiza squash merge hacia `develop`.
4. La promoción de `develop` a `main` ocurre mediante PR de release, con CI verde, revisión y squash merge.
5. Una versión o release tag se crea sólo después de que `main` contiene la promoción aprobada.

No se hace push, merge ni publicación externa sin autorización explícita.
