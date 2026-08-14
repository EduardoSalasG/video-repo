---
name: feature-development
description: End-to-end feature development workflow
---
# Feature Development Workflow

## Process

1. **Requirements Analysis** (Coordinator)
   - Receive feature request
   - Decompose into subtasks
   - Create task entries in `memory/project-state/active-tasks.md`

2. **Specification** (Architect)
   - Review existing architecture in `context/architecture/`
   - Create spec in `context/specs/<feature-name>-spec.md`
   - Include: API contracts, data models, error cases, acceptance criteria

3. **Implementation** (Implementer)
   - Follow TDD: write failing tests first
   - Implement following `context/conventions/coding-standards.md`
   - Run lint/typecheck after each change

4. **Testing** (Tester)
   - Generate additional tests for edge cases
   - Run full test suite
   - Verify coverage targets met

5. **Review** (Reviewer)
   - Code review for correctness, security, maintainability
   - Check adherence to conventions
   - Approve or request changes

6. **Completion** (Coordinator)
   - Verify all acceptance criteria met
   - Update `memory/project-state/recent-changes.md`
   - Mark task complete in `memory/project-state/active-tasks.md`
   - Archive session to `memory/sessions/`