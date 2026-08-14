# Workflow Guide

## Feature Development

### 1. Task Creation (Coordinator)
- Receive requirement
- Create task in `memory/project-state/active-tasks.md`
- Assign to Architect for specification

### 2. Specification (Architect)
- Review `context/architecture/` and `context/decisions/`
- Create spec in `context/specs/<feature>-spec.md`
- Include: API contracts, data models, acceptance criteria
- Mark task ready for implementation

### 3. Implementation (Implementer)
- Read spec and relevant conventions
- Write failing tests first (TDD)
- Implement feature
- Run lint, typecheck, tests
- Commit with proper format

### 4. Testing (Tester)
- Review implementation
- Add edge case tests
- Run full test suite
- Verify coverage targets
- Report results

### 5. Review (Reviewer)
- Code review against checklist
- Security audit
- Approve or request changes

### 6. Completion (Coordinator)
- Verify acceptance criteria
- Update `memory/project-state/recent-changes.md`
- Mark task complete
- Archive session to `memory/sessions/`

## Bug Fix

1. **Reproduce** — Create failing test
2. **Analyze** — Root cause analysis
3. **Fix** — Minimal fix with regression test
4. **Verify** — Full test suite passes
5. **Review** — Security and correctness
6. **Document** — Update learnings if new pattern

## Research Spike

1. **Define Question** — Clear, scoped question
2. **Investigate** — Time-boxed (default 2 hours)
3. **Document** — Findings in `context/decisions/` or `memory/learnings/`
4. **Recommend** — Clear recommendation with trade-offs

## Code Review Checklist
- [ ] Matches specification
- [ ] Follows coding standards
- [ ] Tests pass, coverage adequate
- [ ] No security issues
- [ ] Error handling correct
- [ ] No performance regressions
- [ ] Documentation updated