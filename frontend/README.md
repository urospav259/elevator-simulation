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

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
