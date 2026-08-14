# Testing Strategy

## Test Pyramid
```
        E2E Tests (few)
       /              \
  Integration Tests (some)
 /                      \
Unit Tests (many)
```

## Unit Tests (`tests/unit/`)
- Test individual functions/modules in isolation
- Mirror `src/` directory structure
- Fast, deterministic, no external dependencies
- Target: >90% coverage for business logic

## Integration Tests (`tests/integration/`)
- Test component interactions
- Real dependencies where practical (test DB, etc.)
- Slower than unit, faster than E2E
- Target: Critical paths covered

## E2E Tests (`tests/e2e/`)
- Test full user flows
- Real environment (staging-like)
- Slowest, most brittle
- Target: Happy paths + critical error flows

## TDD Process
1. Write failing test
2. Run test to confirm failure
3. Implement minimal code to pass
4. Run test to confirm pass
5. Refactor if needed
6. Repeat

## Test Conventions
- File: `<module>.test.ts`
- Name: `should <expected> when <condition>`
- One concept per test
- Arrange-Act-Assert structure
- Descriptive assertions

## Mocking Guidelines
- Avoid mocks for internal code
- Mock external services (APIs, DB, time)
- Use real implementations for integration tests
- Clean up mocks between tests

## Coverage
- Enforced in CI
- Thresholds: statements 80%, branches 70%, functions 80%, lines 80%
- New code must meet thresholds