# UpAware — Master Build Prompt

You are a senior full-stack engineer building **UpAware**, a community-powered civic awareness
web application for Dhaka, Bangladesh. You are building this from scratch for a 3-person student
team as part of a Software Development course.

Build **incrementally, step-by-step**. Complete each phase fully before starting the next.
Do not scaffold an entire codebase at once. After each step, verify it works before moving on.

---

## Project Overview

UpAware lets Dhaka residents:
- Post civic problems (waterlogging, road damage, crime, etc.) with a location pin
- Upvote, comment on, and share community issue posts
- See all issues on a live color-coded interactive map (red / amber / green pins)
- Trigger an emergency SOS alert that notifies nearby users in real-time
- Request AI-powered suggestions for a posted issue (explicit opt-in only)
- Join ward-based sub-communities (Dhaka has 92 wards)

Target audience: Dhaka residents on mobile. Design mobile-first.

---

## Tech Stack (Non-Negotiable)

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 14 (App Router) | Framework + SSR |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3 | Styling |
| shadcn/ui | latest | Component library |
| Mapbox GL JS | 3 | Interactive map, clustering, heatmap |
| Socket.io-client | 4 | Real-time feed + map updates |
| TanStack Query | v5 | Server state + caching |
| Axios | latest | HTTP client |
| Zod | 3 | Form + response validation |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js + Express | 20 LTS | REST API server |
| TypeScript | 5+ | Type safety |
| Socket.io | 4 | WebSocket real-time layer |
| Prisma ORM | 5 | Database client |
| PostgreSQL | 15+ | Primary database |
| PostGIS | 3+ | Geospatial queries (radius, distance) |
| bcryptjs | latest | Password hashing |
| jsonwebtoken | latest | JWT auth |
| Multer + Cloudinary | latest | Media uploads |
| Zod | 3 | Input validation on all routes |

### AI
| Tool | Purpose |
|------|---------|
| Anthropic Claude API (`claude-sonnet-4-6`) | Post analysis + solution suggestions |

> Called **server-side only**. User must grant explicit per-post permission.

### Notifications
| Tool | Purpose |
|------|---------|
| Firebase Cloud Messaging (FCM) | Geo-targeted web push for emergency alerts |

### Deployment
| Service | Hosts |
|---------|-------|
| Vercel | Next.js frontend |
| Railway | Express API + PostgreSQL |

---

## Repository Structure

```
upaware/
├── apps/
│   ├── web/                        # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (main)/
│   │   │   │   ├── page.tsx              # Feed (homepage)
│   │   │   │   ├── map/page.tsx          # Live map
│   │   │   │   ├── emergency/page.tsx    # Emergency hub
│   │   │   │   ├── post/[id]/page.tsx    # Single post + comments
│   │   │   │   ├── post/new/page.tsx     # Create post
│   │   │   │   ├── ward/[id]/page.tsx    # Ward circle feed
│   │   │   │   ├── profile/page.tsx      # User profile
│   │   │   │   └── leaderboard/page.tsx  # Top contributors
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── feed/          # PostCard, FeedFilter, VoteButton, CreatePostForm
│   │   │   ├── map/           # MapView, PinPopup, HeatmapToggle, EmergencyRing
│   │   │   ├── emergency/     # SOSButton, EmergencyBanner, ActiveAlerts
│   │   │   ├── ai/            # AISuggestButton, SuggestionCard
│   │   │   ├── layout/        # Navbar, Sidebar, BottomNav (mobile)
│   │   │   └── ui/            # shadcn + custom base components
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePosts.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── useMap.ts
│   │   │   └── useEmergency.ts
│   │   └── lib/
│   │       ├── api.ts          # Axios instance + typed request helpers
│   │       ├── socket.ts       # Socket.io client singleton
│   │       ├── mapbox.ts       # Map config + helper functions
│   │       └── firebase.ts     # FCM push init
│   │
│   └── api/                        # Express.js backend
│       └── src/
│           ├── routes/
│           │   ├── auth.ts
│           │   ├── posts.ts
│           │   ├── votes.ts
│           │   ├── comments.ts
│           │   ├── map.ts
│           │   ├── emergency.ts
│           │   ├── ai.ts
│           │   └── users.ts
│           ├── middleware/
│           │   ├── auth.ts        # JWT verify + attach req.user
│           │   ├── validate.ts    # Zod schema validation wrapper
│           │   └── upload.ts      # Multer + Cloudinary
│           ├── services/
│           │   ├── claude.ts      # Anthropic API calls
│           │   ├── fcm.ts         # Firebase push notification sends
│           │   └── geo.ts         # PostGIS geospatial query helpers
│           ├── socket/
│           │   └── handlers.ts    # Socket.io room + event logic
│           ├── prisma/
│           │   └── client.ts      # Prisma singleton
│           └── index.ts           # App entry: Express + Socket.io server
```

---

## Database Schema (Prisma)

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

enum Role     { USER VOLUNTEER AUTHORITY ADMIN }
enum Category { TRAFFIC INFRASTRUCTURE SAFETY HEALTH ENVIRONMENT CRIME OTHER }
enum Severity { EMERGENCY NORMAL }
enum Status   { OPEN IN_PROGRESS RESOLVED }

model User {
  id           String    @id @default(cuid())
  name         String
  email        String?   @unique
  phone        String?   @unique
  passwordHash String?
  avatarUrl    String?
  ward         Int?
  role         Role      @default(USER)
  isVolunteer  Boolean   @default(false)
  points       Int       @default(0)
  fcmToken     String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  posts        Post[]
  votes        Vote[]
  comments     Comment[]
}

model Post {
  id          String    @id @default(cuid())
  title       String
  body        String
  category    Category
  severity    Severity  @default(NORMAL)
  status      Status    @default(OPEN)
  lat         Float
  lng         Float
  address     String?
  ward        Int?
  mediaUrls   String[]  @default([])
  isAnon      Boolean   @default(false)
  aiAllowed   Boolean   @default(false)
  upvoteCount Int       @default(0)
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  votes       Vote[]
  comments    Comment[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([lat, lng])
  @@index([ward])
  @@index([severity])
  @@index([status])
  @@index([createdAt])
}

model Vote {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, postId])
}

model Comment {
  id        String    @id @default(cuid())
  body      String
  isAnon    Boolean   @default(false)
  authorId  String
  postId    String
  parentId  String?
  author    User      @relation(fields: [authorId], references: [id])
  post      Post      @relation(fields: [postId], references: [id])
  parent    Comment?  @relation("Replies", fields: [parentId], references: [id])
  replies   Comment[] @relation("Replies")
  createdAt DateTime  @default(now())
}
```

---

## API Endpoints

All routes prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <token>` header.

### Auth
```
POST   /auth/register        { name, email, password, ward? }
POST   /auth/login           { email, password }
POST   /auth/refresh         { refreshToken }
```

### Posts
```
GET    /posts                ?ward=&category=&severity=&status=&sort=hot|new|top&page=&limit=
POST   /posts                { title, body, category, severity, lat, lng, address?, ward?, isAnon, aiAllowed } [auth]
GET    /posts/:id
PATCH  /posts/:id            { status?, resolvedNote? }  [auth — author or AUTHORITY]
DELETE /posts/:id            [auth — author or ADMIN]
```

### Voting
```
POST   /posts/:id/vote       (toggles on/off — no body)  [auth]
```

### Comments
```
GET    /posts/:id/comments   ?page=&limit=
POST   /posts/:id/comments   { body, isAnon?, parentId? }  [auth]
DELETE /comments/:id         [auth — author]
```

### Map
```
GET    /map/pins             ?swLat=&swLng=&neLat=&neLng=&severity=
                             → GeoJSON FeatureCollection of all matching posts
GET    /map/heatmap          ?swLat=&swLng=&neLat=&neLng=
                             → GeoJSON points with upvoteCount as weight
```

### Emergency
```
POST   /emergency/trigger    { lat, lng, description? }  [auth]
                             Creates emergency post + emits Socket.io alert + sends FCM push
```

### AI
```
POST   /posts/:id/ai-suggest  [auth — post.aiAllowed must be true]
                              → { suggestions: string[] }  (3 items)
```

### Users
```
GET    /users/me
PATCH  /users/me             { name?, ward?, isVolunteer?, fcmToken? }  [auth]
GET    /users/leaderboard    ?ward=&limit=
```

### Error Response Format (all errors)
```json
{ "error": "Human-readable message", "code": "MACHINE_CODE" }
```

---

## Socket.io Events

### Client → Server
```
join_ward     { wardId: number }     // subscribe to ward room
leave_ward    { wardId: number }
join_city     {}                     // subscribe to city-wide feed
```

### Server → Client
```
new_post          { post: PostSummary }                         // emit to ward + city room
post_updated      { postId, status, upvoteCount }               // emit to ward + post room
emergency_alert   { lat, lng, description?, postId?, timestamp } // emit to ALL clients
pin_update        { postId, lat, lng, status, severity }        // emit to city room
```

### Emit Rules
| Event | Rooms |
|-------|-------|
| `new_post` | `ward:{wardId}` + `city` |
| `post_updated` | `ward:{wardId}` + `post:{postId}` |
| `emergency_alert` | broadcast to ALL |
| `pin_update` | `city` |

---

## UI Design System

### Color Tokens
```css
--primary:    #1D9E75;   /* teal  — brand, upvotes, resolved pins, CTAs   */
--emergency:  #E24B4A;   /* red   — emergency pins, SOS button, alert bar  */
--active:     #F5A623;   /* amber — normal open/in-progress pins           */
--dark:       #1C2B3A;   /* heading text                                   */
--muted:      #5A6A7A;   /* secondary text, labels                         */
--surface:    #F5F6F8;   /* page and card backgrounds                      */
--border:     #E2E8F0;   /* card borders, dividers                         */
```

### Map Pin Logic
| Pin Color | Condition |
|-----------|-----------|
| Red `#E24B4A` | severity = EMERGENCY and status = OPEN |
| Amber `#F5A623` | severity = NORMAL and status ≠ RESOLVED |
| Teal `#1D9E75` | status = RESOLVED (any severity) |

### Typography
- UI font: `Inter` (or Geist default from Next.js)
- Mono font: `JetBrains Mono` (for coordinates/codes only)
- Base size: 15px body, 13px captions, 24–32px headings

### Layout Rules
- **Mobile-first.** The majority of Dhaka users are on mobile.
- **Bottom nav on mobile** (Home, Map, Emergency, Profile — 4 tabs max)
- **Sidebar on desktop** (collapsible, same 4 sections)
- Cards: `rounded-xl`, `border border-border`, `shadow-sm`
- No full-page loading spinners — use skeleton loaders per section

### Key Component Specs

**VoteButton**
- Triangle-up icon, teal when voted, gray when not
- Optimistic update on click — revert if API fails
- Show count next to button

**SOSButton**
- Large, red, circular, bottom-center on Emergency page
- Requires 500ms hold to activate (prevents accidental triggers)
- Shows press-and-hold progress ring during hold
- On release before 500ms: cancel with haptic feedback
- On 500ms complete: confirm modal → trigger API

**PostCard (Feed)**
- Avatar (or "Anonymous" avatar) + name + time
- Title (bold), body preview (2 lines, truncated)
- Category badge (color-coded) + severity indicator
- Media thumbnail (if attached)
- Bottom row: VoteButton, CommentCount, Share, Ward label

**EmergencyBanner**
- Fixed top of viewport, red background, high z-index
- Shows active emergency description + location
- "View on Map" button + "Call 999" link
- Auto-dismisses after 30 min or when status = RESOLVED

---

## AI Feature Specification

### Trigger flow
1. User creates/views a post with `aiAllowed: true`
2. "Get AI Suggestions" button appears on post detail
3. Clicking opens confirmation modal: *"Allow AI to read this post and suggest solutions?"*
4. On confirm → POST /posts/:id/ai-suggest
5. Display 3 suggestion cards in a section below the post

### Claude API call (server-side in `services/claude.ts`)
```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export async function getPostSuggestions(post: {
  title: string; body: string; category: string; ward?: number | null;
}): Promise<string[]> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: `You are a civic problem-solving assistant for Dhaka, Bangladesh.
Given a community issue report, return exactly 3 practical, actionable suggestions
a citizen or local community group can take to address or escalate the problem.
Be specific to Dhaka: mention relevant bodies (DSCC, WASA, BRTA, Rapid Action Battalion,
999 emergency, local ward commissioner office) where appropriate.
Format: Return a JSON array of 3 strings. Each string under 80 words.
Respond in the same language as the post (Bengali or English).`,
    messages: [
      {
        role: "user",
        content: `Title: ${post.title}\nDescription: ${post.body}\nCategory: ${post.category}${post.ward ? `\nWard: ${post.ward}` : ""}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}
```

---

## Map Specification (Mapbox GL JS)

### Init config
```typescript
// lib/mapbox.ts
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export const DHAKA_CENTER: [number, number] = [90.4125, 23.8103];
export const DHAKA_BOUNDS: [[number, number], [number, number]] = [
  [90.2, 23.6],   // SW
  [90.65, 24.1],  // NE
];

export function createMap(container: string): mapboxgl.Map {
  return new mapboxgl.Map({
    container,
    style: "mapbox://styles/mapbox/light-v11",
    center: DHAKA_CENTER,
    zoom: 12,
    maxBounds: DHAKA_BOUNDS,
  });
}
```

### Pin clustering (add to map after style loads)
```typescript
map.addSource("posts", {
  type: "geojson",
  data: { type: "FeatureCollection", features: [] },
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50,
});

// Cluster circles
map.addLayer({
  id: "clusters",
  type: "circle",
  source: "posts",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#1D9E75",
    "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 50, 40],
    "circle-opacity": 0.85,
  },
});

// Individual pins
map.addLayer({
  id: "unclustered-pins",
  type: "circle",
  source: "posts",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": [
      "case",
      ["==", ["get", "status"], "RESOLVED"],        "#1D9E75",
      ["==", ["get", "severity"], "EMERGENCY"],     "#E24B4A",
      "#F5A623",
    ],
    "circle-radius": 8,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#fff",
  },
});
```

### Heatmap overlay (toggle)
```typescript
map.addLayer({
  id: "heatmap",
  type: "heatmap",
  source: "posts",
  maxzoom: 14,
  layout: { visibility: "none" }, // toggled by user
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "upvoteCount"], 0, 0, 50, 1],
    "heatmap-intensity": 1.5,
    "heatmap-color": [
      "interpolate", ["linear"], ["heatmap-density"],
      0, "rgba(29,158,117,0)",
      0.4, "#F5A623",
      1, "#E24B4A",
    ],
    "heatmap-radius": 25,
  },
});
```

### Real-time pin updates
```typescript
// On Socket.io new_post event:
const source = map.getSource("posts") as mapboxgl.GeoJSONSource;
const current = /* current GeoJSON data */;
source.setData({
  ...current,
  features: [...current.features, newFeature],
});

// On emergency_alert event: show pulsing ring at coordinates
// Use a custom HTML marker with CSS animation
```

---

## Emergency System Flow

```
1.  User presses + holds SOS button (500ms)
2.  Confirmation modal: "Confirm emergency? This will alert nearby users."
3.  POST /emergency/trigger { lat, lng, description? }

4.  Server:
    a. Creates Post { severity: EMERGENCY, status: OPEN, ... }
    b. Emits `emergency_alert` to ALL Socket.io clients
    c. Queries FCM tokens of Users within 3km via PostGIS DWithin
    d. Sends FCM push notification to those users

5.  All connected clients:
    a. Show EmergencyBanner at top (fixed, red)
    b. Map: pulsing red ring at emergency coords
    c. Banner: description + "View on Map" + "Call 999" buttons

6.  Auto-expiry: Banner hides 30 minutes after trigger
7.  Manual resolve: AUTHORITY/ADMIN can PATCH post status = RESOLVED → pin_update event
```

### PostGIS query for FCM recipient lookup
```sql
SELECT fcm_token FROM "User"
WHERE fcm_token IS NOT NULL
  AND ST_DWithin(
    ST_MakePoint(lng, lat)::geography,
    ST_MakePoint(${triggerLng}, ${triggerLat})::geography,
    3000  -- 3km radius in meters
  );
```
> Use `prisma.$queryRaw` for this until Prisma natively supports PostGIS functions.

---

## Implementation Order

Work through these in order. Do not skip ahead.

### Phase 1 — Scaffold & Database
- [ ] 1. Create monorepo: `apps/web` (Next.js 14 + TS + Tailwind + shadcn) and `apps/api` (Express + TS)
- [ ] 2. Write Prisma schema, run `prisma migrate dev --name init`
- [ ] 3. Seed DB with 10 sample posts across different Dhaka wards + categories

### Phase 2 — Auth
- [ ] 4. Backend: `POST /auth/register` and `POST /auth/login` (JWT access + refresh tokens)
- [ ] 5. Backend: auth middleware (`verifyToken` → attaches `req.user`)
- [ ] 6. Frontend: Register and Login pages + `useAuth` hook + token storage in localStorage

### Phase 3 — Feed MVP
- [ ] 7. Backend: CRUD for Posts (`GET /posts`, `POST /posts`, `GET /posts/:id`)
- [ ] 8. Frontend: Feed page with PostCard list (skeleton loader, infinite scroll or pagination)
- [ ] 9. Frontend: Create Post page (form with category, severity, lat/lng picker)
- [ ] 10. Frontend: Post Detail page
- [ ] 11. Backend + Frontend: Voting (toggle upvote, optimistic UI)

### Phase 4 — Map
- [ ] 12. Backend: `GET /map/pins` and `GET /map/heatmap` (GeoJSON responses)
- [ ] 13. Frontend: Map page with Mapbox GL JS, centered on Dhaka
- [ ] 14. Frontend: Render color-coded pins + popup on click
- [ ] 15. Frontend: Cluster layer (zoomed out) + Heatmap toggle button

### Phase 5 — Real-time
- [ ] 16. Backend: Socket.io server with room logic (ward rooms + city room)
- [ ] 17. Frontend: Socket.io client singleton, join rooms on mount
- [ ] 18. Frontend: `new_post` event → prepend to feed without reload
- [ ] 19. Frontend: `pin_update` event → update map source data

### Phase 6 — Emergency
- [ ] 20. Frontend: SOSButton with 500ms hold + confirmation modal
- [ ] 21. Backend: `POST /emergency/trigger` → Socket.io emit + FCM push
- [ ] 22. Frontend: EmergencyBanner (fixed top, 30-min auto-dismiss)
- [ ] 23. Frontend: Pulsing red ring marker on Map for active emergency

### Phase 7 — AI
- [ ] 24. Frontend: "Allow AI Help" toggle on Create Post form
- [ ] 25. Backend: `POST /posts/:id/ai-suggest` → Claude API call
- [ ] 26. Frontend: "Get AI Suggestions" button + SuggestionCards on Post Detail

### Phase 8 — Polish (if time allows)
- [ ] 27. Comments (nested, with reply support)
- [ ] 28. Ward circles (`/ward/[id]` page, ward subscription)
- [ ] 29. Media uploads (Cloudinary via Multer)
- [ ] 30. Profile page + points system + leaderboard
- [ ] 31. Mobile bottom nav + full responsive layout audit
- [ ] 32. Bengali language toggle (i18n with `next-intl`)

---

## Coding Standards

These rules are non-negotiable:

| Rule | Detail |
|------|--------|
| **TypeScript strict** | No `any`. Define types in `types/` or co-locate with module. |
| **Zod on all inputs** | Every API route validates request body/query with a Zod schema before touching DB. |
| **One file, one concern** | Routes do routing. Logic goes in services. DB queries go in services or dedicated query files. |
| **Error format** | All errors return `{ error: string, code?: string }` with correct HTTP status. |
| **No over-abstraction** | Only abstract when a pattern repeats 3+ times. |
| **Surgical edits** | When modifying existing code, change only what the task requires. |
| **Prisma transactions** | Wrap multi-step DB writes in `prisma.$transaction([...])`. |
| **Env vars** | Never hardcode secrets. Always use `process.env.*`. Fail fast on startup if required env vars are missing. |
| **Comments** | Comment only non-obvious logic. Name variables and functions to be self-documenting. |
| **Optimistic UI** | Voting and posting should update UI immediately, revert on API error. |

---

## Environment Variables

**`apps/api/.env`**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/upaware
JWT_SECRET=replace-with-long-random-string
JWT_REFRESH_SECRET=replace-with-different-long-random-string
CLAUDE_API_KEY=sk-ant-...
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com
CORS_ORIGIN=http://localhost:3000
PORT=4000
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

---

## Start Here — First Commands

Run these to scaffold the project:

```bash
# 1. Create root
mkdir upaware && cd upaware && git init

# 2. Frontend (Next.js 14 + TS + Tailwind + App Router)
npx create-next-app@14 apps/web \
  --typescript --tailwind --app \
  --no-src-dir --import-alias "@/*"

# 3. Install frontend deps
cd apps/web
npm install @tanstack/react-query axios mapbox-gl socket.io-client zod
npm install -D @types/mapbox-gl

# 4. Add shadcn/ui
npx shadcn-ui@latest init   # choose: Default style, Slate base, CSS variables yes

# 5. Backend scaffold
cd ../..
mkdir -p apps/api/src/{routes,middleware,services,socket,prisma}
cd apps/api && npm init -y

# 6. Install backend deps
npm install express cors dotenv prisma @prisma/client \
  socket.io bcryptjs jsonwebtoken zod \
  multer cloudinary firebase-admin @anthropic-ai/sdk

npm install -D typescript ts-node nodemon \
  @types/express @types/node @types/bcryptjs \
  @types/jsonwebtoken @types/multer

# 7. Prisma init
npx prisma init

# 8. Write schema (paste the schema from this prompt), then:
npx prisma generate
npx prisma migrate dev --name init
```

**After each phase, tell me what you built and I will review before you continue.**

---

*UpAware — Community-Powered Civic Awareness for Dhaka*
*Proposal Version: 1.0 | Stack Lock Date: 2025*
