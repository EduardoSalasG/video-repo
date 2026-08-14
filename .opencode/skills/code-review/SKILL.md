---
name: code-review
description: Code review workflow for quality and security
---
# Code Review Workflow

## Review Checklist

### Correctness
- [ ] Implementation matches specification
- [ ] Edge cases handled
- [ ] Error handling follows `context/conventions/error-handling.md`
- [ ] No logic errors or race conditions

### Security
- [ ] No injection vulnerabilities (SQL, XSS, command)
- [ ] Authentication/authorization on mutating endpoints
- [ ] No secrets in code
- [ ] Input validation at API boundaries
- [ ] No sensitive data in logs

### Maintainability
- [ ] Follows `context/conventions/coding-standards.md`
- [ ] Uses patterns from `context/architecture/patterns.md`
- [ ] Functions are small and focused
- [ ] Clear naming, no magic numbers
- [ ] Appropriate abstraction level

### Testing
- [ ] Unit tests for new logic
- [ ] Integration tests for component interactions
- [ ] Coverage >80% on changed code
- [ ] Tests are deterministic and fast

### Documentation
- [ ] Public APIs documented
- [ ] Complex logic commented
- [ ] ADR updated if architectural change

## Review Process

1. Reviewer reads diff and specification
2. Run automated checks (lint, typecheck, tests)
3. Manual review against checklist
4. Provide specific line-referenced feedback
5. Approve or request changes with clear reasoning