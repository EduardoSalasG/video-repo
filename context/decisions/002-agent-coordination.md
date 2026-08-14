# ADR-002: Agent Coordination via Shared Context and Memory

**Status**: Accepted
**Date**: 2026-01-15
**Deciders**: [Team]
**Technical Story**: Project initialization

## Context
Need to define how multiple specialized agents (architect, implementer, reviewer, tester, researcher, coordinator) collaborate effectively without tight coupling.

## Decision
Agents coordinate through:
1. **Shared Context** (`context/`) — Read-only project knowledge (architecture, specs, conventions)
2. **Agent Memory** (`memory/agents/<name>/`) — Per-agent persistent state
3. **Project State** (`memory/project-state/`) — Coordinator-managed task tracking
4. **Session Transcripts** (`memory/sessions/`) — Historical record

Agents do NOT communicate directly; they read/write shared artifacts.

## Consequences

### Positive
- Loose coupling between agents
- Clear separation of concerns
- Auditability of decisions and actions
- Agents can work asynchronously
- Easy to add/remove agents

### Negative
- Potential for stale context if not updated
- Coordinator becomes central point
- Requires discipline to maintain artifacts

## Alternatives Considered
1. **Direct Agent Communication** — Tight coupling, harder to debug
2. **Message Queue** — Overhead for local development
3. **Shared Database** — Over-engineering for this scale

## Related Decisions
- ADR-001: Use Opencode as Primary Agent Runtime
- ADR-003: Memory Strategy

## Notes
Review coordination effectiveness after 3 sprints.