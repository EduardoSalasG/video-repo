# ADR-001: Use Opencode as Primary Agent Runtime

**Status**: Accepted
**Date**: 2026-01-15
**Deciders**: [Team]
**Technical Story**: Project initialization

## Context
We need to choose an AI coding agent runtime for our multi-agent development system. Options considered: opencode, Claude Code, OpenAI Codex, custom solution.

## Decision
Use opencode as the primary agent runtime with native multi-agent support.

## Consequences

### Positive
- Native agent definitions and coordination
- Built-in skills system for reusable workflows
- Path-scoped rules for contextual instructions
- Local-first, privacy-focused
- Active development and community

### Negative
- Smaller ecosystem than some alternatives
- Team may need to learn opencode-specific patterns

### Neutral
- Can still use other agents for specific tasks if needed

## Alternatives Considered
1. **Claude Code** — Powerful but proprietary, less multi-agent native support
2. **OpenAI Codex** — Good but cloud-dependent, different paradigm
3. **Custom Solution** — Maximum control but high maintenance burden

## Related Decisions
- ADR-002: Agent Coordination Strategy
- ADR-003: Memory Strategy

## Notes
Review quarterly for fitness of purpose.