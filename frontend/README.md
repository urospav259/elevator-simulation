# Elevator Simulation Frontend

Next.js frontend for the elevator simulation app. The backend is expected to run on `http://localhost:3000`, while the frontend runs on `http://localhost:3001`.

## Environment

Create `frontend/.env.local` if you need to override the backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

If this variable is not set, the frontend defaults to `http://localhost:3000`.

## Running The App

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3001` in the browser.

## UI Flow

The dashboard loads the building list on the server, then uses SSE in the browser for live building state updates.

Main flows:

- Select or create a building.
- Use the floor grid call buttons to request an elevator from any floor.
- Use Passenger POV to choose your current floor, call up/down, wait for doors to open, and then choose a destination floor.
- The POV session resets when the selected elevator reaches the destination floor and opens its doors.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
