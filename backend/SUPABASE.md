# Supabase

Project: **naccash-motors-v2** (`rfzxzkjfimaywufxdiav`)  
Region: `ap-southeast-1`

## Connection strings

Copy `backend/.env.example` to `backend/.env` and replace `YOUR_DB_PASSWORD` with your database password from the [Supabase dashboard](https://supabase.com/dashboard/project/rfzxzkjfimaywufxdiav/settings/database).

- **DATABASE_URL** — pooled connection (port 6543) for the app runtime
- **DIRECT_URL** — direct connection (port 5432) for Prisma migrations

## Migrations

Schema is managed via Supabase migrations in `backend/supabase/migrations/`.

```bash
cd backend
supabase link --project-ref rfzxzkjfimaywufxdiav
supabase db push --linked
```

## Admin login

- Email: `admin@cardealer.com`
- Password: `admin123`

## Firebase deployment

After setting secrets in Firebase:

```bash
firebase functions:secrets:set DATABASE_URL --project naccashmotor
firebase functions:secrets:set DIRECT_URL --project naccashmotor
firebase functions:secrets:set JWT_SECRET --project naccashmotor
firebase deploy --only functions --project naccashmotor
```

Note: Firebase Functions require the **Blaze** plan.
