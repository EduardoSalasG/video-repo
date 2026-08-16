# AGENTS.md

Multi-agent software development project for opencode.

## Project Overview

Monorepo with two workspaces:

- `backend/` — REST API (Express + Prisma + PostgreSQL), see `backend/package.json`
- `frontend/` — React SPA (Vite + TypeScript + Tailwind), see `frontend/package.json`

Root `package.json` uses npm workspaces; run workspace commands with `npm run <script> --workspace backend` (or `--workspace frontend`). The root `verify`/`typecheck`/`lint`/`test` scripts run across all workspaces.

This project is developed by a coordinated multi-agent system. Each agent has a specialized role:

- **architect** — System design, architecture decisions, tech stack choices
- **implementer** — Feature implementation, bug fixes, code changes
- **reviewer** — Code review, security audit, quality assurance
- **tester** — Test generation, test execution, coverage analysis
- **researcher** — Investigation, spike tasks, technology evaluation
- **coordinator** — Task decomposition, agent orchestration, progress tracking

## Agent Coordination

Agents collaborate through:
1. **Context files** in `context/` — Shared project knowledge (read-only for agents)
2. **Memory files** in `memory/` — Persistent agent state (read/write per agent)
3. **Task handoffs** via `memory/project-state/active-tasks.md`
4. **Session transcripts** in `memory/sessions/`

## Build & Test Commands

```bash
# Install dependencies (root workspaces)
npm install

# Development (defaults to backend)
npm run dev --workspace backend
npm run dev --workspace frontend

# Build / typecheck / lint / test per workspace
npm run build --workspace backend
npm run typecheck --workspace backend
npm run lint --workspace backend
npm test --workspace backend

# Across all workspaces
npm run typecheck
npm run lint
npm test
```

## Code Style

- TypeScript strict mode enabled
- ESLint + Prettier configured
- Single quotes, no semicolons (Prettier)
- Functional patterns preferred over classes
- Explicit error handling with custom error types
- All async functions must handle errors

## Testing Strategy

- Unit tests: `backend/tests/unit/` — Test individual functions/modules
- Integration tests: `backend/tests/integration/` — Test component interactions
- E2E tests: `backend/tests/e2e/` — Test full user flows
- TDD: Write failing test first, then implementation
- Target: >80% coverage on critical paths

## Agent Workflow

1. **Coordinator** receives task, decomposes into subtasks
2. **Architect** reviews/creates PRD in `context/specs/`
3. **Architect** creates technical spec from PRD
4. **Implementer** writes code following `context/conventions/`
5. **Tester** generates/updates tests
6. **Reviewer** reviews code, checks against rules
7. **Coordinator** verifies completion, updates project state

## PRD (Product Requirements Document) Usage

### When to Create a PRD
- New product initiatives
- Major feature epics
- Significant changes affecting multiple components
- Stakeholder alignment needed before technical design

### PRD Location & Format
- **Template**: `context/specs/PRD-TEMPLATE.md`
- **Storage**: `context/specs/prd-<feature-name>.md`
- **Format**: Markdown with structured sections (see template)

### PRD → Spec Flow
```
PRD (context/specs/prd-*.md)
    �� Architect analyzes
Technical Spec (context/specs/<feature>-spec.md)
    �� Implementer implements
Code + Tests (backend/src/, backend/tests/)
```

### PRD Sections Required
1. Executive Summary
2. Problem Statement + Goals/Metrics
3. User Personas & Stories
4. Functional Requirements (with acceptance criteria)
5. Non-Functional Requirements
6. Technical Requirements
7. Release Plan + Rollout Strategy
8. Risks & Mitigations

## Memory & Context Usage

### Reading Context (All Agents)
- `context/architecture/` — System design, patterns, data flow
- `context/decisions/` — ADRs for architectural choices
- `context/specs/` — PRDs and technical specifications
- `context/conventions/` — Coding standards, workflows
- `context/onboarding/` — Project overview, agent roles

### Writing Memory (Per Agent)
Each agent maintains memory in `memory/agents/<agent-name>/`:
- `MEMORY.md` — Index + key learnings (loaded every session)
- Topic files — Detailed notes (loaded on demand)

### Project State (Coordinator)
- `memory/project-state/active-tasks.md` — Current work items
- `memory/project-state/recent-changes.md` — Recent modifications
- `memory/project-state/open-issues.md` — Known issues/blockers

## Security & Compliance

- No secrets in code — use environment variables
- All external inputs validated at API boundaries
- Authentication required for all mutating operations
- Audit logging for sensitive operations
- Dependencies scanned for vulnerabilities

## Git Workflow (Simplified Gitflow + Conventional Commits)

### Branching Model
```
main (production-ready, tagged releases)
  ↑ merge --no-ff
develop (integration branch for next release)
  ↑ feature branches
feature/<agent>-<task-id>-<short-desc>
  ↑ release branches (from develop)
release/v<major>.<minor>.<patch>
  ↑ hotfix branches (from main)
hotfix/v<major>.<minor>.<patch>
```

### Branch Types & Rules

| Branch | From | Merge To | Lifetime | Naming |
|--------|------|----------|----------|--------|
| `main` | — | — | Permanent | `main` |
| `develop` | `main` | — | Permanent | `develop` |
| Feature | `develop` | `develop` | Temporary | `feature/<agent>-<task-id>-<desc>` |
| Release | `develop` | `main` + `develop` | Temporary | `release/v<version>` |
| Hotfix | `main` | `main` + `develop` | Temporary | `hotfix/v<version>` |

### Commit Message Format (Conventional Commits)
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`

**Agent Attribution** (in body/footer, not type):
```
feat(api): add user authentication endpoint

Implements user login with JWT tokens.

Co-authored-by: implementer <agent@implementer>
Refs: TASK-123
```

### Examples
```
feat(auth): add JWT-based authentication
fix(cache): resolve race condition in Redis cache
docs(spec): add PRD template for feature requirements
refactor(api): extract validation middleware
test(unit): add tests for user service
chore(deps): update TypeScript to 5.3
```

### Breaking Changes
```
feat(api)!: remove deprecated /v1/users endpoint

BREAKING CHANGE: /v1/users replaced by /v2/users with new schema
```

### PR Process
1. Create feature branch from `develop`
2. Make atomic commits with Conventional Commits format
3. Push branch, create PR targeting `develop`
4. CI runs: lint, typecheck, tests
5. Reviewer approves (required)
6. Squash merge to `develop` (preserves clean history)
7. Delete feature branch

### Release Process
1. Create `release/v<version>` from `develop`
2. Bump version, update CHANGELOG
3. Test, fix bugs on release branch
4. Merge to `main` with `--no-ff`, tag `v<version>`
5. Merge back to `develop`
6. Delete release branch

### Hotfix Process
1. Create `hotfix/v<version>` from `main` tag
2. Fix bug, bump patch version
3. Merge to `main` with `--no-ff`, tag `v<version>`
4. Merge to `develop` (or current release branch)
5. Delete hotfix branch

### Git Hooks (Configured in .opencode/settings.json)
- `pre-commit`: lint + typecheck on staged files
- `commit-msg`: validate Conventional Commits format
- `pre-push`: run tests