# ♟ ChessMate — India's Chess Tournament Hub

Full-stack web application for discovering chess tournaments, tracking FIDE ratings, and analyzing games.

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, TanStack Query v5, Zustand, Recharts, react-chessboard + chess.js

**Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, JWT auth, Zod validation, Helmet/CORS security

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL (local or Neon.tech free tier)

### 2. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL and JWT_SECRET

cp frontend/.env.example frontend/.env
# VITE_API_URL=http://localhost:4000/api (default)
```

### 4. Set Up Database
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

### 5. Run Dev Servers
```bash
# Terminal 1 — Backend (port 4000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open http://localhost:5173

## Demo Credentials
| Role   | Email                 | Password  |
|--------|-----------------------|-----------|
| Admin  | admin@chessmate.in    | admin123  |
| Player | arjun@chessmate.in    | player123 |

## API Reference
- GET  /api/tournaments         — List tournaments (search, filter, paginate)
- GET  /api/tournaments/:slug   — Tournament detail
- POST /api/tournaments         — Create (admin only)
- PUT  /api/tournaments/:id     — Update (admin only)
- DELETE /api/tournaments/:id   — Delete (admin only)
- POST /api/auth/login          — Login
- POST /api/auth/register       — Register
- GET  /api/auth/me             — Current user
- GET  /api/players/:username   — Player profile
- GET  /api/analytics/dashboard — Analytics (admin only)

## Features
- Tournament listings with search + multi-filter (state/format/status/FIDE rated)
- Full tournament detail pages with prize fund tables, venue, registration links
- Interactive chess board (react-chessboard) with PGN/FEN import, move navigation, engine eval bar
- FIDE Rating Calculator with K-factor auto-detection and per-game breakdown
- Player profiles with ELO history chart (Recharts) and tournament history
- JWT auth, admin role, protected routes
- Admin panel — create, edit, delete tournaments + analytics dashboard

## Deployment
- Backend → Railway / Render / Fly.io (set DATABASE_URL, JWT_SECRET, NODE_ENV=production)
- Frontend → Vercel / Netlify (set VITE_API_URL to your backend URL, output: dist/)
- Database → Neon.tech (free PostgreSQL)


Sriramking21!