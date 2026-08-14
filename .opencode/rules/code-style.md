---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Code Style Rules

## TypeScript
- Strict mode enabled — no `any`, no implicit any
- Use `type` over `interface` for unions/intersections
- Prefer `const` over `let`; avoid `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)

## Formatting (Prettier)
- Single quotes
- No semicolons
- 2-space indentation
- Trailing commas: es5
- Print width: 100

## Patterns
- Functional patterns preferred over classes
- Use `map`, `filter`, `reduce` over loops
- Early returns over nested conditionals
- Destructure imports: `import { foo } from 'bar'`

## Naming
- camelCase for variables/functions
- PascalCase for types/components
- UPPER_SNAKE_CASE for constants
- Descriptive names: `getUserById` not `getUser`

## Error Handling
- Custom error types for domain errors
- All async functions: try/catch with AppError
- Never swallow errors silently
- Log errors with context, not stack traces in production