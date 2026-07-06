# 🏋️ Reppod

**A two-sided coaching SaaS for personal trainers and their clients.**

Trainers build workout programs, assign them to clients, attach demo videos, and
track engagement. Clients get their own portal to watch demos, log their own
sessions, see their progress, and message their coach. Built as a full-stack
MERN-style app on **Next.js 16 + MongoDB**, with motion-rich UI throughout.

> This is a portfolio project demonstrating real-product patterns: role-based
> two-sided auth, an invite flow, drag-and-drop builders, file/video uploads,
> engagement analytics, and in-app notifications.

---

## ✨ Features

### Marketing site
- Animated landing page — parallax hero, 3D-tilt feature cards, scroll-triggered
  count-up stats, animated pricing toggle, buttery smooth scrolling (Lenis).

### Authentication & roles
- Email/password auth (Auth.js v5 / NextAuth) with JWT sessions, bcrypt hashing.
- Optional Google OAuth (auto-enabled when credentials are provided).
- **Two roles** — `trainer` and `client` — with role-based routing:
  `/dashboard` for trainers, `/app` for clients. The wrong role is redirected.
- **Invite flow** — a trainer adds a client, copies an invite link, and the
  client sets a password to create their own linked account.

### Trainer dashboard (`/dashboard`)
- **Clients** — full CRUD with an animated list, search, status (active/paused/
  archived), goals, and per-client invite links.
- **Workout builder** — drag-and-drop exercise ordering (dnd-kit) with per-exercise
  sets / reps / rest, plus an exercise picker filtered by muscle group.
- **Demo videos** — attach a Cloudinary-hosted video to any exercise.
- **Assignments** — assign workouts from the library to clients.
- **Progress** — log sessions on a client's behalf; view an animated volume chart
  (Recharts) + session history.
- **Engagement** — per-client video watch-% and exercise completion at a glance.
- **Messaging** — a two-way chat thread with each client.
- **Notifications** — an in-app bell with unread counts.
- **Settings** — profile, business name, units (kg/lb), avatar upload, password.

### Client portal (`/app`)
- **Today** — assigned workouts + quick stats.
- **Workout view** — watch each exercise's demo video (watch progress tracked
  automatically) and **log your own sets/reps/weight**.
- **Progress** — personal volume chart + full session history.
- **Messages** — chat with your coach.
- **Settings** — profile, units, avatar, password.
- Mobile-friendly bottom navigation.

---

## 🧱 Tech stack

| Layer        | Choice                                                        |
| ------------ | ------------------------------------------------------------- |
| Framework    | **Next.js 16** (App Router, Turbopack, React 19)              |
| Language     | **TypeScript**                                                |
| Database     | **MongoDB** + **Mongoose**                                    |
| Auth         | **Auth.js v5** (NextAuth) — Credentials + optional Google     |
| Validation   | **Zod** (shared client/server schemas)                        |
| Styling      | **Tailwind CSS v4**                                           |
| Animation    | **Framer Motion** (components) · **Lenis** (smooth scroll)    |
| Drag & drop  | **dnd-kit**                                                   |
| Charts       | **Recharts**                                                  |
| Media        | **Cloudinary** (unsigned uploads — avatars & exercise videos) |
| Icons        | **lucide-react**                                              |

---

## 🏛️ Architecture

### Two-sided, role-based

Both roles share one sign-in page and one `User` collection. The `role` field
(`trainer` | `client`) drives everything:

| Role        | Home         | Capabilities                                                       |
| ----------- | ------------ | ------------------------------------------------------------------ |
| **Trainer** | `/dashboard` | Build workouts, manage clients, assign, log on behalf, review, chat |
| **Client**  | `/app`       | Watch demos, **log own sessions**, view progress, chat with coach  |

Routing is enforced in two places:
- **`src/proxy.ts`** (Next.js 16's renamed middleware) + **`src/auth.config.ts`** —
  an edge-safe `authorized` callback gates `/dashboard` (trainer-only) and `/app`
  (client-only), and redirects logged-in users away from the auth pages to their
  role's home.
- Server components additionally call `requireTrainer()` / `requireClient()` from
  `src/lib/auth-helpers.ts` as a defense-in-depth check.

> Auth.js config is **split** so middleware stays edge-safe: `auth.config.ts` holds
> only edge-compatible logic (callbacks, routing), while `auth.ts` adds the
> Credentials/Google providers and Mongoose access used in the Node runtime.

### The invite flow

```
Trainer adds client ─▶ server generates inviteToken ─▶ trainer copies /invite/<token>
        │                                                        │
        ▼                                                        ▼
Client record (inviteStatus: pending)                 Client opens link, sets password
        │                                                        │
        └──────────────── linked via Client.user ◀── User created (role: client)
                                                       inviteStatus: accepted
```

Tokens are generated on demand (`POST /api/clients/[id]/invite`), which also
backfills clients created before the field existed.

### Data flow

- **Server Components** read directly from MongoDB via Mongoose and pass plain
  serialized objects to client components.
- **Client Components** mutate through **Route Handlers** (`/api/**`), which
  validate input with shared Zod schemas and enforce ownership.
- **Notifications** are written as a best-effort side effect of key actions
  (assign, log, message, invite-accepted) and polled by the bell component.

### Ownership & security

- Every `/api` route checks the session and that the resource belongs to the
  caller (a trainer only touches their own clients/workouts; a client only their
  own data, resolved via `Client.user`).
- Passwords hashed with bcrypt (cost 12); `passwordHash` is `select: false`.
- Deletes cascade: removing a client also removes their assignments, sessions,
  messages, notifications, and linked login — nothing is left orphaned.

---

## 🗂️ Data models

| Model               | Purpose                                                            |
| ------------------- | ------------------------------------------------------------------ |
| `User`              | Trainer or client account (role, bio, units, businessName, image)  |
| `Client`            | A trainer's client record; optionally linked to a `User` via invite |
| `Workout`           | A program; embeds `blocks` (exercise + sets/reps/rest + videoUrl)  |
| `WorkoutAssignment` | Junction: which workout is assigned to which client                |
| `WorkoutSession`    | A logged session (per-set reps × weight); powers progress + volume |
| `Message`           | One chat message in a trainer↔client thread                        |
| `Notification`      | An in-app notification for a user                                  |
| `VideoProgress`     | Per (client, workout, exercise) watch progress: %, completed       |

Exercises themselves are a static catalog in `src/lib/exercises.ts` (muscle group
+ equipment), keeping the demo self-contained.

---

## 📁 Project structure

```
src/
├── app/
│   ├── (auth)/                 # Sign-in / sign-up (shared animated layout)
│   ├── api/                    # Route Handlers
│   │   ├── auth/[...nextauth]/  #   Auth.js handlers
│   │   ├── register/           #   Trainer sign-up
│   │   ├── invite/[token]/     #   Validate + accept invite
│   │   ├── clients/[id]/...     #   Clients + nested assignments/sessions/messages/invite
│   │   ├── workouts/[id]/       #   Workout CRUD
│   │   ├── me/...               #   Client-facing: workouts, sessions, messages, video-progress, profile, password
│   │   └── notifications/       #   List + mark-read
│   ├── dashboard/              # Trainer area (sidebar + topbar + mobile nav)
│   │   ├── clients/[id]/        #   Tabbed detail: Overview/Workouts/Progress/Engagement/Messages
│   │   ├── workouts/[new|[id]]  #   Builder + detail
│   │   └── settings/
│   ├── app/                    # Client portal (own nav)
│   │   ├── workouts/[id]/       #   Watch videos + log session
│   │   ├── progress/  messages/  settings/
│   ├── invite/[token]/         # Public invite-accept page
│   ├── layout.tsx              # Root: fonts, SessionProvider, Lenis
│   └── page.tsx                # Landing page
├── components/
│   ├── sections/               # Landing page sections
│   ├── dashboard/  client-portal/  client-detail/  workouts/  messaging/  notifications/  settings/
│   ├── SmoothScrollProvider.tsx  AuthSessionProvider.tsx  Navbar.tsx
├── lib/
│   ├── mongoose.ts  mongodb.ts # Cached connections
│   ├── auth-helpers.ts  api-helpers.ts
│   ├── exercises.ts  units.ts  utils.ts
│   └── schemas/                # Zod: client, workout, progress, video, profile
├── models/                     # Mongoose models (see table above)
├── auth.ts  auth.config.ts     # Auth.js (split for edge safety)
└── proxy.ts                    # Next 16 middleware → role-based routing
```

---

## 🚀 Getting started

### Prerequisites
- Node.js **20.9+**
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas) — free tier is plenty)

### Setup

```bash
git clone https://github.com/farhan-shafi/flexflow.git
cd flexflow
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable                              | Required | Notes                                                       |
| ------------------------------------- | :------: | ----------------------------------------------------------- |
| `AUTH_SECRET`                         |    ✅    | `openssl rand -base64 32`                                   |
| `MONGODB_URI`                         |    ✅    | Atlas string or `mongodb://localhost:27017/flexflow`        |
| `GOOGLE_CLIENT_ID` / `..._SECRET`     |    —     | Enables Google sign-in when both are set                    |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`   |    —     | Enables avatar + exercise-video uploads                     |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`|    —     | Must be an **unsigned** preset; set Resource type to "Auto" for video |

> `NEXT_PUBLIC_*` vars are read at server start — restart `npm run dev` after changing them.

### Scripts

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # serve the production build
```

---

## 🧪 Try the full loop

1. **Sign up** at `/sign-up` → you're a trainer in `/dashboard`.
2. **Build a workout** (Workouts → New) — drag in exercises, set reps, optionally
   attach a demo video.
3. **Add a client** → copy their **invite link**.
4. Open the invite link in an **incognito window** → set a password → you're now in
   the **client portal** (`/app`).
5. As the client: open the workout, **watch the video**, **log your sets**.
6. Back as the trainer: open the client → **Engagement** shows watch %, **Progress**
   shows the logged session, and **Messages** works both ways.

---

## 🗺️ Roadmap

- [x] Animated marketing site
- [x] Two-sided auth + invite flow + role routing
- [x] Clients CRUD, workout builder, assignments
- [x] Progress logging + charts
- [x] Two-way messaging + notifications
- [x] Settings, profile, Cloudinary avatars
- [x] Per-exercise demo videos + watch tracking + engagement analytics
- [ ] Billing (LemonSqueezy — Pakistan/global-friendly merchant of record)
- [ ] Password reset via email
- [ ] Streak / achievement animations

---

## 📝 Notes

- Built on **Next.js 16** — Turbopack is the default; middleware is `proxy.ts`.
- All interactive UI is client components; everything else is server-rendered for
  speed and SEO.
- Demo data is self-contained — no external services are required to run the core
  app (Cloudinary and Google are optional enhancements).
