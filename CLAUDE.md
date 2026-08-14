@AGENTS.md

## Claude Code Additions

### Opencode-Specific Configuration

- Opencode settings: `.opencode/settings.json`
- Agent definitions: `.opencode/agents/`
- Skills: `.opencode/skills/`
- Rules: `.opencode/rules/`

### Agent Invocation

Use opencode's native agent system. Agents are defined in `.opencode/agents/*.md` and invoked automatically based on task type.

### Memory Management

- Auto memory: Enabled (stored in `~/.claude/projects/<project>/memory/`)
- Project memory: `memory/` folder (agent-managed)
- Context: `context/` folder (read-only project knowledge)