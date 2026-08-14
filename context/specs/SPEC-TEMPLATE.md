# Feature Specification Template

## Feature: [Name]

**Status**: Draft | Approved | In Progress | Complete
**Owner**: [Agent/Person]
**Created**: YYYY-MM-DD
**Updated**: YYYY-MM-DD

## Problem Statement
[What problem does this solve? Who is it for?]

## Goals
- [Goal 1]
- [Goal 2]

## Non-Goals
- [Non-goal 1]
- [Non-goal 2]

## User Stories
1. As a [user], I want to [action] so that [benefit]
2. As a [user], I want to [action] so that [benefit]

## API Contract

### Endpoint: [METHOD /path]
**Request**:
```json
{
  "field": "type"
}
```

**Response** (200):
```json
{
  "field": "type"
}
```

**Errors**:
- 400: Validation error
- 401: Unauthorized
- 404: Not found
- 500: Internal error

## Data Model
```typescript
interface Entity {
  id: string;
  field: Type;
  createdAt: Date;
  updatedAt: Date;
}
```

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Edge Cases
- [Edge case 1]
- [Edge case 2]

## Dependencies
- [Dependency 1]
- [Dependency 2]

## Testing Requirements
- Unit tests for [components]
- Integration tests for [flows]
- E2E tests for [user journeys]

## Rollout Plan
1. [Step 1]
2. [Step 2]

## Monitoring
- [Metric 1]
- [Metric 2]