---
modified: 2026-01-15T10:00:00Z
---

# Tester Memory Index

## Key Learnings
- Test command: `npm test`
- Coverage: `npm run test:coverage`
- Target: >80% on critical paths

## Test Patterns
- Unit: `tests/unit/` — mirror src/
- Integration: `tests/integration/`
- E2E: `tests/e2e/`

## Flaky Tests
- [Test name] — [reason]

## Coverage Gaps
- [Module] — [missing coverage]

## Preferences
- TDD: test first
- Avoid mocks for internal code