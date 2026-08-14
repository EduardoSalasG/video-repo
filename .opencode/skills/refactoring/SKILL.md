---
name: refactoring
description: Safe refactoring workflow
---
# Refactoring Workflow

## Principles

- **Refactor only with tests** — Never refactor without test coverage
- **Small steps** — One refactoring at a time, commit after each
- **Preserve behavior** — All tests must pass before and after
- **YAGNI** — Don't add abstraction until needed

## Process

1. **Identify Need** (Any Agent)
   - Code smell detected (duplication, complexity, coupling)
   - Document in `memory/project-state/active-tasks.md`

2. **Assess Risk** (Implementer/Reviewer)
   - Check test coverage of affected code
   - Identify dependencies and callers
   - Estimate effort

3. **Prepare** (Implementer)
   - Ensure tests pass before starting
   - Add missing tests if needed (characterization tests)

4. **Refactor** (Implementer)
   - Apply one refactoring pattern at a time
   - Run tests after each step
   - Commit after each successful step

5. **Verify** (Tester/Reviewer)
   - Run full test suite
   - Check for performance regressions
   - Verify no behavior changes

6. **Document** (Coordinator)
   - Update `context/architecture/patterns.md` if new pattern
   - Update `memory/project-state/recent-changes.md`