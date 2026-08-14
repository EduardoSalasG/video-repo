# Coding Standards

## TypeScript
- Strict mode: enabled
- Target: ES2022
- Module: ESNext
- ModuleResolution: Bundler
- No implicit any: true
- Strict null checks: true

## Code Style (Enforced by Prettier)
- Single quotes
- No semicolons
- 2-space indentation
- Trailing commas: es5
- Print width: 100
- Arrow functions for callbacks

## Patterns
- Functional over OOP
- Immutability by default
- Composition over inheritance
- Pure functions where possible
- Early returns

## Naming Conventions
- Variables/functions: camelCase
- Types/interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case
- Test files: *.test.ts
- Boolean prefixes: is, has, should, can

## Error Handling
- Custom error classes extending Error
- All async functions: try/catch
- Never swallow errors
- Log with context, not stack traces
- Return Result<T, E> for expected errors

## Async Patterns
- async/await over promises
- Parallel with Promise.all when independent
- Sequential when dependent
- Timeout for external calls

## Imports
- Destructured: `import { foo } from 'bar'`
- Relative imports for local, absolute for packages
- Group: external, internal, relative
- Sort alphabetically within groups