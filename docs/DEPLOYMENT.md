# Supabase and Vercel deployment

## 1. Configure Supabase

1. Create the project with **Data API** enabled, **Automatically expose new tables** disabled, and **automatic RLS** enabled.
2. Open **SQL Editor**, paste `supabase/migrations/20260806042000_initial_platform.sql`, and run it once.
3. Open **Connect → App Frameworks → Next.js** and copy the project URL and publishable key. Do not copy the secret/service-role key into this app.
4. Under **Authentication → URL Configuration**, set the production Site URL to the Vercel domain and allow:
   - `http://localhost:3000/**`
   - `https://YOUR-VERCEL-DOMAIN/**`

Supabase's default confirmation email works without extra configuration: after confirming, the user returns to the Site URL and can sign in. If custom SMTP is enabled later, the template can instead link directly through the app's confirmation handler:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/profile
```

## 2. Configure Vercel

Use the existing repository connection. In project settings:

- Framework Preset: `Next.js`
- Root Directory: blank or `./`
- Build Command: `npm run build` (default)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Apply the variables to Production and Preview as intended, then redeploy. Vercel receives the full repository so it can build Next.js, but it cannot bypass RLS because it has no database password or privileged Supabase key.

## 3. Create the first administrator

Register your own account normally, then run this once in the Supabase SQL Editor, replacing the email:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

Refresh the application after signing out and back in. Public registration cannot request the admin role.

## 4. Production separation

For a larger production launch, use a second Supabase project for production and keep `lockedin-dev` for local/preview deployments. Apply the same migration to each project and assign different Vercel environment values by environment. No database files or sample accounts are committed to GitHub.
