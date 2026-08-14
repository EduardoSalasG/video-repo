# Design Patterns

## Creational Patterns
- **Factory**: Used for [use case] — see `src/factories/`
- **Builder**: Used for [use case] — see `src/builders/`

## Structural Patterns
- **Adapter**: Used for [external service integration]
- **Decorator**: Used for [cross-cutting concerns like logging]

## Behavioral Patterns
- **Strategy**: Used for [algorithm variations] — see `src/strategies/`
- **Observer**: Used for [event-driven communication] — see `src/events/`

## Architectural Patterns
- **Layered Architecture**: [domain/app/infra layers]
- **Repository Pattern**: Data access abstraction
- **CQRS**: [if applicable] Command/Query separation
- **Event Sourcing**: [if applicable] State from event log

## Anti-Patterns to Avoid
- God objects/classes
- Circular dependencies
- Leaky abstractions
- Premature optimization