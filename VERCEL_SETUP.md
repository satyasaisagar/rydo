# 🐘 Vercel Postgres Setup Guide for Rydo

This guide walks you through connecting a Vercel Postgres (Neon) database to the Rydo backend.

---

## Step 1 — Create a Vercel Postgres Database

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your team **Sagar's projects**
3. Click **Storage** in the left sidebar
4. Click **Create Database** → choose **Postgres (Neon)**
5. Name it **`rydo-db`**, select region **Mumbai (ap-south-1)** or nearest
6. Click **Create**

---

## Step 2 — Connect the Database to Your Projects

After creating the database:

1. In the database dashboard, click **Connect Project**
2. Select (or create) your **rydo-backend** project
3. Vercel automatically injects these environment variables:
   ```
   POSTGRES_URL
   POSTGRES_URL_NON_POOLING
   POSTGRES_PRISMA_URL
   POSTGRES_HOST
   POSTGRES_USER
   POSTGRES_PASSWORD
   POSTGRES_DATABASE
   ```

---

## Step 3 — Create Vercel Projects from GitHub

### Backend Project
1. Go to **New Project** on Vercel
2. Import from GitHub: `satyasaisagar/rydo`
3. Set **Root Directory** to `backend`
4. Framework: **Other**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add all environment variables from `backend/.env.example`

### Frontend Project
1. **New Project** → import same repo
2. Set **Root Directory** to `frontend`
3. Framework: **Next.js** (auto-detected)
4. Add env vars:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.vercel.app
   ```

---

## Step 4 — Run Migrations on Vercel Postgres

Once environment variables are set, run migrations locally using the Vercel connection string:

```bash
# Pull env vars from Vercel
./scripts/setup-vercel-db.sh

# Run TypeORM migrations against Vercel Postgres
cd backend
npm run migration:run

# Seed with sample data
npm run seed
```

Or run in Vercel's build command:
```bash
npm run build && npm run migration:run
```

---

## Step 5 — Create Upstash Redis (for caching & sessions)

1. Go to **Storage** → **Create Database** → **KV (Upstash Redis)**
2. Name it **`rydo-cache`**
3. Connect to both backend projects
4. Vercel injects:
   ```
   KV_URL
   KV_REST_API_URL
   KV_REST_API_TOKEN
   ```

---

## Environment Variables Auto-Detected by Rydo

The backend automatically detects Vercel-injected vars (no code changes needed):

| Vercel Var | Used For |
|------------|----------|
| `POSTGRES_URL` | Main pooled DB connection |
| `POSTGRES_URL_NON_POOLING` | Migrations (direct connection) |
| `KV_URL` | Redis/cache connection |
| `DATABASE_URL` | Fallback if POSTGRES_URL not set |
| `REDIS_URL` | Fallback if KV_URL not set |

---

## Local Development

Local Docker setup still works unchanged:

```bash
docker compose up -d postgres redis   # start local DB + Redis
cd backend && npm run start:dev        # API uses DB_HOST/DB_PORT vars
cd frontend && npm run dev             # Web app
```

To use Vercel Postgres locally:

```bash
vercel env pull backend/.env --environment=production
cd backend && npm run start:dev        # Now uses POSTGRES_URL
```
