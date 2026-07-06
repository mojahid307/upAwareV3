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

The frontend runs entirely on **mock data** out of the box, so it works with no backend or database.

```bash
npm run dev:web
# → http://localhost:3000
```

To point it at a running backend, copy `apps/web/.env.example` to `.env.local` and fill it in.

### Backend (`apps/api`)

```bash
# 1. Configure DB + secrets
cp apps/api/.env.example apps/api/.env
#   edit DATABASE_URL, JWT_SECRET, etc.

# 2. Run migrations + seed sample data
npm run db:generate
npm run db:migrate
npm run db:seed

# 3. Start the API
npm run dev:api
# → http://localhost:4000/api/v1
```

## Implemented Scope (Phase 1–3, ~25%)

| Area | Status |
|------|--------|
| Monorepo scaffold (npm workspaces) | ✅ |
| Design system (color tokens, typography, base UI) | ✅ |
| Mobile-first layout (Navbar, Sidebar, BottomNav) | ✅ |
| Feed page with PostCard + skeleton loaders | ✅ (mock data) |
| Auth pages (login/register) + `useAuth` hook | ✅ |
| Typed API client (`lib/api.ts`) | ✅ |
| Prisma schema (User, Post, Vote, Comment + enums) | ✅ |
| Auth routes (register/login/refresh) + JWT middleware | ✅ |
| Posts CRUD + Zod validation | ✅ |
| Seed script (10 sample posts across Dhaka wards) | ✅ |
| Map, real-time sockets, emergency SOS, AI | 🔜 later phases |

See `UpAware_Build_Prompt.md` for the full specification.
