# LockedIn backend architecture

## Runtime

LockedIn is a Next.js App Router monolith: Vercel runs both the React application and `app/api/**` route handlers. Supabase provides email/password authentication, managed Postgres, Row Level Security (RLS), and Realtime. Domain modules under `lib/` keep validation and workflow logic separate from route transport code.

No service-role key is used by the application. Each request carries the signed-in user's Supabase session, so database reads are restricted by that user's RLS policies even if a route handler has a bug.

## Authentication and authorization

Supabase Auth manages password hashing, verification, tokens, and account confirmation. `proxy.ts` refreshes expiring sessions; server code validates claims and then reads the matching `profiles` row. The signup trigger accepts only `student` or `tutor`, preventing metadata from creating an administrator.

Authorization has three layers:

1. Route handlers enforce authentication and roles.
2. database RLS restricts every readable row to public catalog data, an owner, a tutoring participant, or an administrator;
3. `security definer` functions re-check the actor and perform sensitive multi-table writes atomically.

## Relational model

| Table | Purpose |
| --- | --- |
| `profiles` | Display identity and student/tutor/admin role linked to `auth.users` |
| `student_profiles` | Grade, guardian, goals, and time zone |
| `tutor_profiles` | School, biography, pricing, approval, and time zone |
| `subjects` | Public normalized subject catalog |
| `tutor_subjects` | Many-to-many tutor expertise mapping |
| `inquiries` | Student intake, requested tutor, routed tutor, and lifecycle |
| `conversations` / `conversation_members` | Private tutoring conversations and read positions |
| `messages` | Ordered chat messages published through Realtime |
| `availability_slots` | Tutor-owned bookable time windows |
| `bookings` | Student/tutor session request and lifecycle |
| `curriculum_goals` / `progress_entries` | Objectives, tutor notes, next steps, and mastery |
| `notifications` | Per-user event notifications |

Foreign keys use cascade or null-on-delete behavior as appropriate. Check constraints protect lengths, mastery, positive pricing, and ordered time ranges.

## Atomic workflows and indexing

- `create_inquiry` chooses an approved qualified tutor by active load, then creates the inquiry, conversation, memberships, initial message, and notification in one transaction.
- `create_booking` locks an open slot before booking it. PostgreSQL exclusion constraints prevent overlapping active tutor or student sessions even under concurrent requests.
- `send_message`, booking transitions, curriculum updates, tutor approval, and inquiry reassignment are database functions with explicit execution grants.
- Discovery, inquiry routing, conversation history, availability, booking history, curriculum, and unread notifications have targeted indexes.

## API surface

| Area | Routes |
| --- | --- |
| Accounts | `/api/auth/register`, `/login`, `/logout`, `/me` |
| Profiles | `/api/profile`, `/api/tutors`, `/api/tutors/:id`, `/api/subjects` |
| Intake | `/api/inquiries`, `/api/inquiries/:id` |
| Chat | `/api/conversations`, `/api/conversations/:id/messages` |
| Scheduling | `/api/availability`, `/api/bookings`, and ID routes |
| Curriculum | `/api/curriculum`, `/api/curriculum/entries` |
| Workspace | `/api/dashboard`, `/api/notifications` |
| Administration | `/api/admin` |

All write bodies are parsed by Zod. Expected failures return structured HTTP errors. Chat receives inserts through a Supabase Realtime subscription and refreshes through the authorized API.
