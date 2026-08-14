---
paths:
  - "tests/**/*.ts"
  - "tests/**/*.tsx"
---

# Testing Rules

## Structure
- Unit tests: `tests/unit/` — mirror `src/` structure
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/`

## Conventions
- TDD: write failing test first
- Test file: `<module>.test.ts`
- Test name: `should <expected> when <condition>`
- One assertion per test (or related assertions)
- Use `describe` for grouping, `it` for tests

## Mocking
- Avoid mocks where possible
- Use real implementations for integration tests
- Mock only external dependencies (APIs, DB, time)
- Use `vi.fn()` for Vitest mocks

## Coverage
- Target: >80% on critical paths
- Coverage checked in CI
- New code must have tests

## Async Testing
- Use `await` for promises
- Test both success and error paths
- Use `fakeTimers` for time-dependent code