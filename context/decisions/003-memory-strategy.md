# ADR-003: Hierarchical Memory Strategy

**Status**: Accepted
**Date**: 2026-01-15
**Deciders**: [Team]
**Technical Story**: Project initialization

## Context
Need to define how agents persist and retrieve knowledge across sessions. Requirements: per-agent isolation, cross-agent learning, project-level knowledge, session history.

## Decision
Three-tier memory hierarchy:

### Tier 1: Context (Read-Only, Project-Level)
- `context/` — Architecture, decisions, specs, conventions
- Written by: Architect, Coordinator
- Read by: All agents
- Persists across project lifetime

### Tier 2: Agent Memory (Read/Write, Per-Agent)
- `memory/agents/<agent-name>/` — MEMORY.md + topic files
- Written by: Respective agent
- Read by: Respective agent (loaded each session)
- Persists across sessions

### Tier 3: Project State (Coordinator-Managed)
- `memory/project-state/` — Active tasks, recent changes, open issues
- Written by: Coordinator
- Read by: All agents
- Updated continuously

### Tier 4: Sessions (Append-Only)
- `memory/sessions/` — Session transcripts/summaries
- Written by: All agents
- Read by: Agents for context
- Archived after completion

## Consequences

### Positive
- Clear ownership and access patterns
- Scales with number of agents
- Enables cross-session learning
- Audit trail for decisions

### Negative
- Multiple memory locations to manage
- Potential for inconsistency
- Coordinator must maintain project state

## Alternatives Considered
1. **Single Shared Memory** — Conflicts, no isolation
2. **Database-Backed** — Overhead, complexity
3. **No Persistence** — Lose learning across sessions

## Related Decisions
- ADR-001: Use Opencode as Primary Agent Runtime
- ADR-002: Agent Coordination Strategy

## Notes
Auto-memory enabled in opencode settings for additional learning.