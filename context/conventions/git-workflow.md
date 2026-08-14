# Git Workflow

## Branch Naming
Format: `<agent>/<task-id>-<short-description>`
Examples:
- `architect/123-design-user-api`
- `implementer/456-add-auth-middleware`
- `tester/789-add-integration-tests`

## Commit Format
Format: `[<agent>] <type>: <message>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `test`: Test changes
- `docs`: Documentation
- `chore`: Maintenance

Examples:
- `[implementer] feat: add user authentication endpoint`
- `[reviewer] fix: resolve race condition in cache`
- `[tester] test: add integration tests for user API`

## Pull Requests
- Required for all changes to main
- Title: `[<agent>] <type>: <message>`
- Description: Link to task, summary of changes, testing done
- Reviewers: At least one other agent role
- CI must pass: lint, typecheck, tests
- Squash merge to main

## Workflow
1. Coordinator creates task in `memory/project-state/active-tasks.md`
2. Agent creates branch from main
3. Agent implements, commits with proper format
4. Agent pushes branch, creates PR
5. Reviewer reviews, approves or requests changes
6. CI passes
7. Coordinator merges, updates project state