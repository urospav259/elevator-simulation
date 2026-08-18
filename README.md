# Elevator Simulation

Full-stack elevator simulation built with NestJS, PostgreSQL, TypeORM, and Next.js.

The backend owns the elevator state and simulation. The frontend renders the building and subscribes to live state updates through Server-Sent Events.

## Repository Structure

```text
/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## Requirements

- Node.js
- npm
- Docker, for local PostgreSQL

## Local Setup

Start PostgreSQL:

```bash
docker compose up -d
```

Install and prepare the backend:

```bash
cd backend
npm install
npm run db:setup
npm run start:dev
```

The backend runs on `http://localhost:3000`.

Install and start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3001`.

## Environment

Backend default local database URL:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/elevator_simulation
```

Frontend default backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Both defaults work with the provided `docker-compose.yml`.

## Architecture Summary

Backend follows Clean Architecture:

- `domain`: entities, domain services, domain errors, domain types.
- `application`: use cases and ports.
- `interface`: HTTP controllers, DTO validation, error filter.
- `infrastructure`: TypeORM entities, PostgreSQL repositories, migrations, simulation ticker, SSE publisher.

TypeORM entities are infrastructure models only. Domain entities are separate classes and contain business behavior. Controllers do not access the database directly; they call application use cases.

Frontend uses Next.js Server Components by default:

- `app/page.tsx` fetches buildings on the server and reads `buildingId` from the URL.
- `ElevatorDashboard` and `BuildingManagement` are server-rendered shell/list components.
- Client components are limited to browser interactions: create-building modal, SSE live state, elevator call buttons, and passenger POV flow.

## Persistence And Simulation

PostgreSQL stores buildings, elevators, and elevator calls. Migrations create the schema and seed a default building with three elevators.

The backend scheduler ticks active buildings every 15 seconds. Active buildings are buildings with assigned elevator calls. This keeps simulation state backend-driven and avoids frontend-side movement logic.

SSE is used for live updates because it is simple, one-way, and enough for this simulation. The frontend sends commands through HTTP and receives state changes through SSE.

## Important Decisions And Tradeoffs

- Elevator assignment lives in domain/application logic, not in controllers or frontend.
- The frontend does not simulate elevator movement; it only renders backend state.
- The backend publishes full building elevator state after destination selection, so clients do not temporarily lose unchanged elevators.
- Completed calls remain stored for audit/debugging. A cleanup/archive job could be added later.
- Current consistency is designed for normal single-instance operation. If multiple backend instances were required, the scheduler should be protected with a single-worker strategy or database advisory lock.
- Database writes for related elevator/call updates are intentionally simple for the assignment scope. A future hardening step would introduce a Unit of Work or explicit transaction boundary for multi-repository updates.

## Tests

Backend tests:

```bash
cd backend
npm run test
```

Frontend build/lint checks:

```bash
cd frontend
npm run build
npm run lint
```

## Manual Review Checklist

Run this before submitting the assignment.

### Setup

1. Run `docker compose up -d`.
2. Run `cd backend && npm install && npm run db:setup && npm run start:dev`.
3. Run `cd frontend && npm install && npm run dev`.
4. Open `http://localhost:3001`.

Expected: frontend loads, default building is visible, and SSE status becomes connected.

### Building Management

1. Create a new building with a valid name, floor count, and elevator count.
2. Confirm URL changes to `/?buildingId=<new-id>`.
3. Refresh the page.

Expected: selected building remains selected from the URL, and the building list is server-rendered.

Validation checks:

1. Try an empty building name.
2. Try `0` floors.
3. Try more than `30` floors.
4. Try more than `10` elevators.

Expected: invalid input is rejected with a clear error.

### Elevator Calls

1. Call an elevator from a floor using the floor grid.
2. Watch the selected elevator receive a stop.
3. Wait for backend ticks.

Expected: backend chooses the elevator, the frontend shows movement, and no frontend-only movement calculation occurs.

### Passenger POV

1. Pick a current floor in Passenger POV.
2. Call up or down.
3. Wait until an elevator opens its doors on that floor.
4. Select a destination floor.

Expected: destination buttons unlock only after doors open, and the selected elevator receives the destination. Other elevators must remain visible immediately after destination selection.

### Multiple Elevators And Requests

1. Create multiple calls from different floors.
2. Use different directions where possible.
3. Watch several ticks.

Expected: elevators keep independent state and multiple outstanding requests remain visible.

### Error Cases

1. Call an invalid floor through Postman or curl.
2. Pick a destination before doors are open.
3. Request a missing building/elevator id.

Expected: API returns controlled 400/404-style responses, not uncontrolled server errors.

### Restart

1. Stop the backend.
2. Start it again.
3. Refresh the frontend.

Expected: buildings and elevator state are loaded from PostgreSQL.

## More Details

See:

- `backend/README.md` for backend API, architecture, migrations, and SSE details.
- `frontend/README.md` for frontend runtime and UI flow details.
