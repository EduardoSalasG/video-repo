# Project Overview

## What is this?
[Product description — what does it do, who is it for]

## Architecture Summary
[Brief overview referencing context/architecture/overview.md]

## Agent Roles
See `context/onboarding/agent-roles.md`

## Key Directories
| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code |
| `tests/` | All tests |
| `context/` | Project knowledge (read-only) |
| `memory/` | Agent state (read/write) |
| `.opencode/` | Opencode configuration |

## Getting Started
1. Read `AGENTS.md` for full instructions
2. Review `context/architecture/overview.md`
3. Check `context/conventions/coding-standards.md`
4. Run `npm install`
5. Run `npm run dev` to start development

## Key Commands
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run typecheck  # Type checking
npm run lint       # Linting
npm test           # Run tests
```

## Common Tasks
- New feature: Coordinator creates task → Architect specs → Implementer codes → Tester tests → Reviewer reviews
- Bug fix: Implementer reproduces → Fixes → Tester verifies → Reviewer reviews
- Research: Researcher investigates → Documents in context/decisions/ or memory/learnings/