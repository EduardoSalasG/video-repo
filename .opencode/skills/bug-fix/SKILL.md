---
name: bug-fix
description: Bug investigation and fix workflow
---
# Bug Fix Workflow

## Process

1. **Reproduction** (Implementer/Tester)
   - Create failing test that reproduces the bug
   - Document steps in `memory/sessions/<date>-bug-fix.md`

2. **Root Cause Analysis** (Implementer/Researcher)
   - Investigate using systematic debugging
   - Check `memory/agents/implementer/gotchas.md` for similar issues
   - Document findings

3. **Fix Implementation** (Implementer)
   - Implement minimal fix
   - Ensure existing tests still pass
   - Add regression test

4. **Verification** (Tester)
   - Run full test suite
   - Verify fix doesn't introduce regressions

5. **Review** (Reviewer)
   - Review fix for correctness and completeness
   - Check for similar issues elsewhere

6. **Documentation** (Coordinator)
   - Update `memory/learnings/debugging-patterns.md` if new pattern
   - Update `memory/project-state/recent-changes.md`
   - Close task in `memory/project-state/active-tasks.md`