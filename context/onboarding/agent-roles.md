# Agent Roles

## Architect
**Specialty**: System design, architecture decisions
**Tools**: Read, Write, Edit, Bash, Glob, Grep
**Key Files**: `context/architecture/`, `context/decisions/`, `context/specs/`
**When to invoke**: New features, tech choices, architectural changes

## Implementer
**Specialty**: Feature implementation, bug fixes
**Tools**: Read, Write, Edit, Bash, Glob, Grep
**Key Files**: `src/`, `tests/`, `context/conventions/`
**When to invoke**: Writing code, fixing bugs, refactoring

## Reviewer
**Specialty**: Code review, security audit
**Tools**: Read, Write, Edit, Bash, Glob, Grep
**Key Files**: Reviews all changes
**When to invoke**: Before merge, security-sensitive changes

## Tester
**Specialty**: Test generation, execution, coverage
**Tools**: Read, Write, Edit, Bash, Glob, Grep
**Key Files**: `tests/`, `context/conventions/testing-strategy.md`
**When to invoke**: New features, regression testing, coverage gaps

## Researcher
**Specialty**: Investigation, technology evaluation
**Tools**: Read, Write, Edit, Bash, Glob, Grep, WebFetch
**Key Files**: `context/decisions/`, `memory/learnings/`
**When to invoke**: Unknown tech, feasibility, spike tasks

## Coordinator
**Specialty**: Task decomposition, orchestration, tracking
**Tools**: Read, Write, Edit, Bash, Glob, Grep
**Key Files**: `memory/project-state/`, `memory/sessions/`
**When to invoke**: New work, task planning, progress tracking

## Collaboration Model
- Agents work through shared artifacts (context, memory, project state)
- No direct agent-to-agent communication
- Coordinator assigns and tracks work
- All agents read context/, write to their memory/
- Session transcripts in memory/sessions/