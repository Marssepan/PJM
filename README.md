# PJM — Polski Język Migowy

Web application for learning Polish Sign Language (PJM): video dictionary, thematic
categories and the fingerspelling alphabet. Engineering thesis project.

| Part | Stack |
|---|---|
| `frontend/` | React 18, Vite, Framer Motion · WCAG 2.2 AA · hash routing |
| `backend/` | Node.js, Express, Prisma 5, TypeScript (run with `tsx`) · helmet, rate limiting |
| Database | PostgreSQL 16 (`unaccent` extension for accent-insensitive search) |

```
PJM/
├─ frontend/                  React app
├─ backend/
│  ├─ src/index.ts            API server
│  ├─ prisma/schema.prisma    data model
│  ├─ prisma/migrations/      database migrations
│  ├─ prisma/seed.ts          categories, signs, alphabet
│  └─ public/videos/          ← PUT YOUR .mp4 FILES HERE
├─ docker-compose.yml         local PostgreSQL
├─ render.yaml                backend hosting config (Render)
├─ .github/workflows/         frontend hosting (GitHub Pages)
└─ DEPLOY.md                  how to publish online
```

## Run locally

Requirements: Node.js 20+, Docker Desktop.

```bash
# 1. Database
docker compose up -d

# 2. Backend  → http://localhost:3001
cd backend
cp .env.example .env
npm install
npx prisma migrate reset --force     # creates tables + runs the seed (wipes local DB)
npm run dev

# 3. Frontend → http://localhost:5173   (second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

`npx prisma migrate reset` deletes all local data and rebuilds it from the seed — use it the
first time, or whenever the local database gets out of sync.

## Videos

Copy all `.mp4` files into `backend/public/videos/`. File names must match the database
exactly (see `prisma/seed.ts`), e.g. `rodzina_mama.mp4`, `alfabet_ą.mp4`.

## API

| Endpoint | Description |
|---|---|
| `GET /api/health` | server + database status |
| `GET /api/categories` | categories with their signs |
| `GET /api/signs/search?q=` | case- and accent-insensitive search (`zolw` → `Żółw`) |
| `GET /api/alphabet` | alphabet in Polish order, with `requiresMovement` |
| `GET /videos/<file>` | video files (local development) |

## Useful commands (backend)

| Command | What it does |
|---|---|
| `npm run dev` | start API, restart on file change |
| `npm run typecheck` | TypeScript check without running |
| `npm run db:migrate` | create a migration after changing `schema.prisma` |
| `npm run db:seed` | reload seed data |
| `npm run db:studio` | browse the database in the browser |

After `prisma generate` / `migrate`, restart `npm run dev` manually — the running server keeps
the old Prisma client in memory.

## Publish online

See **[DEPLOY.md](DEPLOY.md)** — GitHub Pages + Render + Neon, all free.
