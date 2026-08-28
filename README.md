# KHMC Suggestion Box

Patient feedback and suggestion system for KHMC.

## Run locally

npm install
npm run dev

Patient form: `/`
Admin view: `/admin`

## Supabase
Run `supabase.sql` in the Supabase SQL Editor, then configure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables.

Protect the admin route with authentication before public production use.