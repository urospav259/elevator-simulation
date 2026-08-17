# Elevator Simulation Backend

NestJS backend for an elevator simulation app. The application stores buildings, elevators, and elevator calls in PostgreSQL, moves elevators through a backend scheduler, and streams the current building state to clients through SSE.

## What The Application Does

- Creates buildings with configurable floor and elevator counts.
- Stores buildings, elevators, and elevator calls in PostgreSQL.
- Assigns the optimal elevator for a call based on the current floor, movement direction, and existing stops.
- Allows a passenger to choose a destination once they are inside an elevator.
- Runs a backend simulation tick every 15 seconds for active buildings.
- Publishes state changes through a Server-Sent Events endpoint.

## Technologies

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- RxJS / SSE
- Jest

## Architecture

The elevator module follows Clean Architecture principles:

- `domain/` contains business rules: entities, domain services, types, and errors.
- `application/` contains use cases and ports, without depending on NestJS, TypeORM, or HTTP details.
- `interface/` contains controllers, DTO validation, and the HTTP error filter.
- `infrastructure/` contains TypeORM models, PostgreSQL repositories, migrations, and the simulation ticker.

This is why the project has separate domain classes and TypeORM ORM entity classes. Domain classes keep the business logic, while ORM entities describe how data is stored in the database.

## Environment

The backend reads the database connection from `DATABASE_URL`, or from individual PostgreSQL environment variables.

Minimal `.env` example:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/elevator_simulation
```

Alternative configuration:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=elevator_simulation
POSTGRES_MAINTENANCE_DB=postgres
```

`POSTGRES_MAINTENANCE_DB` is only used when creating the database if it does not already exist.

## Installation

```bash
npm install
```

## Database And Migrations

Before starting the application, make sure a PostgreSQL server is running locally or that `DATABASE_URL` points to an available PostgreSQL instance.

Run the full database setup:

```bash
npm run db:setup
```

This command creates the database if it does not exist, then runs the migrations. The current migrations create the schema and seed one default building with three elevators.

Run only the migrations:

```bash
npm run migration:run
```

Revert the latest migration:

```bash
npm run migration:revert
```

## Running The Application

Development mode:

```bash
npm run start:dev
```

Standard start:

```bash
npm run start
```

Production build and start:

```bash
npm run build
npm run start:prod
```

By default, the application runs on `http://localhost:3000`.

## Tests

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:cov
```

## API Endpoints

### Buildings

List buildings:

```http
GET /buildings
```

Create a building:

```http
POST /buildings
Content-Type: application/json

{
  "name": "Office Tower",
  "floors": 10,
  "elevators": 3
}
```

Validation currently limits a building to 1-30 floors and 1-10 elevators.

### Building State

Get the current building state:

```http
GET /building-state/:buildingId
```

Run a manual simulation tick for a building:

```http
POST /building-state/tick
Content-Type: application/json

{
  "buildingId": "00000000-0000-4000-8000-000000000001"
}
```

Stream live building state:

```http
GET /building-state/:buildingId/events
```

This is an SSE endpoint. The frontend connects through `EventSource`; the backend sends the initial state immediately and then streams new state events whenever the state changes.

Frontend connection example:

```ts
const events = new EventSource(
  'http://localhost:3000/building-state/00000000-0000-4000-8000-000000000001/events',
);

events.addEventListener('building-state', (event) => {
  const state = JSON.parse(event.data);
  console.log(state);
});

// Close the subscription when the user switches buildings or leaves the screen.
events.close();
```

### Elevator Calls

Call an elevator from a floor:

```http
POST /elevator-calls
Content-Type: application/json

{
  "buildingId": "00000000-0000-4000-8000-000000000001",
  "floor": 4,
  "direction": "UP"
}
```

Choose a destination from inside an elevator:

```http
POST /elevator-calls/pick-destination
Content-Type: application/json

{
  "elevatorId": "10000000-0000-4000-8000-000000000001",
  "floor": 8
}
```

The destination endpoint is intentionally guarded by the application layer: a passenger can choose a destination only after the assigned elevator has opened its doors. After a destination is accepted, the backend publishes the updated building state through SSE.

## Simulation

The backend uses `@nestjs/schedule` and `ElevatorSimulationTicker`. The ticker runs every 15 seconds and moves only active buildings, meaning buildings that currently have assigned elevator calls.

This keeps the simulation state backend-driven. If multiple clients follow the same building, they all receive the same state through SSE.

## Error Handling

HTTP controllers use `HttpErrorFilter`. Domain and application layers throw regular errors for invalid states, and the filter maps them to HTTP responses:

- `404` for errors that indicate an entity was not found.
- `400` for other validation and business-rule errors.

DTO validation is handled at the HTTP boundary through NestJS `ValidationPipe`, while domain entities still protect core business invariants.

## Notes

- TypeORM `synchronize` is disabled. Database schema changes are handled through migrations.
- The application layer depends on ports, while concrete PostgreSQL implementations are wired in `elevator.module.ts`.
- Completed elevator calls remain in the database for audit/debug purposes. They can later be archived or removed through a cleanup job if needed.
