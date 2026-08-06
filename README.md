# LockedIn Tutoring

LockedIn is a full-stack tutoring marketplace. Students discover tutors, submit an academic intake, chat privately, request sessions, and follow curriculum progress. Tutors manage profiles, availability, booking requests, conversations, and progress notes. Administrators approve tutors and route inquiries.

The application is one Next.js project backed by Supabase Auth, Postgres, Row Level Security, database functions, and Realtime. Vercel hosts the Next.js UI and route handlers; Supabase hosts identity and data.

## Run locally

Requirements: Node.js 20.9 or newer and a Supabase project.

1. Copy `.env.example` to `.env.local` and add the project URL and publishable key from **Supabase → Connect → App Frameworks**.
2. Apply `supabase/migrations/20260806042000_initial_platform.sql` with the Supabase SQL Editor or CLI.
3. Install and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Never put a database password, secret key, or service-role key in `.env.local`, Vercel, or browser code. This application intentionally uses the publishable key plus RLS.

## Deploy on Vercel

Keep the Vercel project connected to this repository and leave **Root Directory** blank (or `./`). The frontend and `app/api/**` backend handlers belong to the same Next.js deployment—do not select the `app` directory.

Add these Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Then configure the deployed URL in **Supabase → Authentication → URL Configuration** as the Site URL and an allowed redirect URL. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the complete sequence and admin bootstrap command.

## Repository and preview separation

Git tracks the schema and application, but not local credentials or sample activity:

- `.env.local` is ignored
- `.local-preview/` is ignored
- local preview mode is rejected whenever `NODE_ENV=production`
- the migration includes only the public subject catalog, never sample users or credentials

A GitHub/Vercel deployment therefore gets the real sign-in page and its Supabase data, not the local quick-login demonstration.

## Product flows

- Supabase email/password registration and secure cookie sessions
- Approved tutor directory with text, subject, and rate filtering
- Indexed, load-aware student inquiry routing
- Private one-to-one conversations with Realtime message delivery
- Conflict-safe tutor availability and session requests
- Tutor confirmation, completion, and participant cancellation
- Curriculum goals, mastery ratings, progress notes, and next steps
- In-app notifications for inquiries, messages, bookings, and progress
- Administrator tutor approval and inquiry management

## Quality checks

```bash
npm run check
```

## Backend structure

- `app/api/` — authenticated Next.js route handlers
- `lib/supabase/` — browser/server clients, session refresh, and error mapping
- `lib/auth.ts` — Supabase Auth operations and role resolution
- `lib/validation.ts` — Zod schemas for every write endpoint
- `lib/inquiries.ts`, `lib/conversations.ts`, `lib/scheduling.ts`, `lib/curriculum.ts` — domain operations
- `supabase/migrations/` — Postgres schema, constraints, functions, grants, RLS, and Realtime setup
- `docs/ARCHITECTURE.md` — data model and security design
