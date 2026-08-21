# UpAware

**Community-Powered Civic Awareness for Dhaka, Bangladesh.**

UpAware lets Dhaka residents post civic problems (waterlogging, road damage, crime, etc.) with a
location pin, upvote and comment on community issues, see them on a live color-coded map, and trigger
an emergency SOS that alerts nearby users in real time.

This monorepo contains the **Next.js 14 frontend** (`apps/web`) and the **Express + Prisma backend**
(`apps/api`).

---

## Repository Layout

```
upaware/
├── apps/
│   ├── web/   # Next.js 14 (App Router) + TS + Tailwind + shadcn-style UI
│   └── api/   # Express + TypeScript + Prisma + PostgreSQL + Socket.io
├── package.json     # npm workspaces root
└── README.md
```

## Prerequisites

- **Node.js 20+** (developed on Node 24)
- **npm 10+** (npm workspaces — no pnpm/yarn required)
- **PostgreSQL 15+ with PostGIS 3+** for the backend database

## Quick Start

Install all workspace dependencies from the root:

```bash
npm install
```

### Frontend (`apps/web`)

The frontend runs on **mock data** out of the box with zero external dependencies (interactive map, emergency SOS, AI suggestions, threaded comments, ward circles, profile, and leaderboard all work without setting up a backend).

```bash
npm run dev:web
# → http://localhost:3000
```

To connect to your Express/Supabase backend, create `apps/web/.env.local` using `apps/web/.env.example`.

### Backend (`apps/api`) & Supabase Database

UpAware is configured for **Supabase PostgreSQL** (or any Postgres 15+ database with PostGIS).

```bash
# 1. Configure DB connection & JWT secrets
cp apps/api/.env.example apps/api/.env
# Set DATABASE_URL (Supabase connection pooler on port 6543 with ?pgbouncer=true)
# Set DIRECT_URL (Supabase direct connection on port 5432)
# Set JWT_SECRET, JWT_REFRESH_SECRET, CLAUDE_API_KEY (optional)

# 2. Run migrations + seed sample Dhaka civic posts
npm run db:generate
npm run db:migrate
npm run db:seed

# 3. Start the API server
npm run dev:api
# → http://localhost:4000/api/v1
```


