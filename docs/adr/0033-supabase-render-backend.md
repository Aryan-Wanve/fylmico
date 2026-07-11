# 0033: Backend Deployment on Supabase + Render

Date: 2026-07-11

Status: Accepted

## Problem

ADR 0032 planned to deploy the API + Postgres to a Hostinger VPS. It
turned out no such VPS actually exists/is available. The backend still
needs somewhere to run - without it, none of the real features built this
session (auth, houses, tasks, projects, crews, messages, calendar,
analytics/time-tracking) work for real users, no matter how fresh the
static frontend export is.

## Decision

Split the backend across two managed free-tier services instead of a
self-managed VPS:

- **Supabase** hosts Postgres only. Prisma's `DATABASE_URL` points at
  Supabase's connection string - no other Supabase feature (their own
  auth, storage, auto-REST layer) is used; this app keeps its own auth
  (ADR 0003/0019) and has no object storage yet (ADR 0013, still
  deferred). Use the **direct connection** string (port `5432`), not the
  pooled/PgBooster one (port `6543`) - Render's API runs as one
  long-lived process, not a burst of serverless invocations, so there's
  no need for connection pooling, and Prisma's default query engine
  doesn't play well with PgBouncer's transaction-mode pooling without
  extra configuration (`?pgbouncer=true`, disabling prepared statements).
  Keeping the direct connection avoids that class of problem entirely.
- **Render** hosts the NestJS API as a Docker web service, built directly
  from the existing `apps/api/Dockerfile` - no new Dockerfile needed.
  Render's own GitHub integration (connect once via its dashboard) is the
  entire CD pipeline: it rebuilds and redeploys automatically on every
  push to `main` with no custom GitHub Actions workflow required, unlike
  the VPS plan which needed a hand-rolled SSH-based workflow.
- **`render.yaml`** (a Render "Blueprint") captures the service
  definition as code - Docker runtime, `apps/api/Dockerfile`, a health
  check at `/api/v1/health` (already existed, ADR 0018), and the env var
  list with secrets marked `sync: false` (set once in Render's dashboard,
  never committed).
- **Migrations run automatically on every deploy**: `apps/api/Dockerfile`'s
  `CMD` now runs `npx prisma migrate deploy` before starting the server
  (`sh -c "npx prisma migrate deploy ... && node apps/api/dist/main.js"`),
  so schema changes ship with the code that needs them without a
  separate CI step - simpler than the VPS plan's dedicated
  `deploy/deploy.sh` step, since the migration now lives where the app
  boots instead of in an external script.
- **Removed** the VPS-specific artifacts from ADR 0032:
  `docker-compose.prod.yml`, `deploy/` (env template, deploy script,
  Nginx config), and `.github/workflows/deploy-vps.yml`. None of them
  apply to a managed-platform deploy.
- **The Hostinger static-frontend pipeline is unchanged** - ADR 0032's
  `.github/workflows/deploy-hostinger.yml` still rebuilds and republishes
  the static export on every push; only `NEXT_PUBLIC_API_URL` needs to
  point at the new Render URL (`https://fylmico-api.onrender.com` or a
  custom domain later) instead of a VPS subdomain.

### One-time setup (manual - account-level steps this tooling can't do)

1. **Create a Supabase project** (free tier). From its dashboard, copy
   the **direct** Postgres connection string (Settings -> Database ->
   Connection string -> URI, "Direct connection", not "Transaction
   pooler").
2. **Create a Render account**, connect the GitHub repo, choose "New +
   Blueprint," point it at this repo - Render reads `render.yaml` and
   proposes the `fylmico-api` service.
3. **Fill in the three `sync: false` env vars** in Render's dashboard:
   - `DATABASE_URL`: the Supabase connection string from step 1.
   - `CORS_ORIGIN`: the live Hostinger frontend's real URL.
   - `JWT_ACCESS_SECRET`: a generated secret (`openssl rand -hex 64`).
4. **Deploy** - Render builds `apps/api/Dockerfile` and starts the
   service; watch the logs for `Nest application successfully started`.
5. **Copy the Render service's public URL** (e.g.
   `https://fylmico-api.onrender.com`) and set it as the
   `NEXT_PUBLIC_API_URL` GitHub repository variable (Settings -> Secrets
   and variables -> Actions -> Variables) so the next Hostinger rebuild
   bakes in the real API URL.
6. **Push anything to `main`** (or manually re-run
   `deploy-hostinger.yml`) to trigger a rebuild that picks up the new
   `NEXT_PUBLIC_API_URL`.

After this, every push to `main` deploys both halves with zero manual
steps: Render redeploys the API (and runs migrations) on its own; GitHub
Actions rebuilds and republishes the Hostinger static export.

## Alternatives

- Retry the Hostinger VPS plan (ADR 0032) once a VPS becomes available.
  Rejected for now: no VPS exists today, and Render's native GitHub
  auto-deploy is strictly less operational work than a hand-rolled SSH
  pipeline even if a VPS did exist later.
- Use Supabase for the API too (Edge Functions). Rejected: Supabase Edge
  Functions run on Deno, not Node, and don't support a persistent NestJS
  application with Nest's dependency injection / module system - porting
  would mean rewriting the entire backend, not deploying it.
- Use Railway for both API and Postgres (the third option offered).
  Rejected per the explicit choice to split Supabase (database) +
  Render (compute) instead.
- Use Supabase's pooled/PgBouncer connection string for simplicity of
  copy-paste. Rejected: Render's API is a single long-running process,
  not a serverless function fleet, so pooling buys nothing here while
  introducing the prepared-statement compatibility issue Prisma has with
  PgBouncer's transaction mode.

## Tradeoffs

Benefits:

- No server to patch, secure, or monitor - both Supabase and Render
  manage the underlying infrastructure.
- Render's built-in GitHub integration means the backend's CD pipeline is
  configuration, not code - `render.yaml` plus three dashboard-entered
  secrets, versus the VPS plan's custom SSH workflow, deploy script, and
  Nginx/certbot setup.
- Migrations-on-boot means there's no separate "did the migration step
  run" question - if the container started successfully, the schema is
  current.

Costs:

- Render's free tier spins the service down after a period of
  inactivity; the first request after idling will be slow (cold start)
  until a paid plan is used.
- Supabase's free tier pauses a project after a week of inactivity,
  which would need manual un-pausing from their dashboard if the app
  goes quiet for that long during early testing.
- No custom domain for the API yet (`*.onrender.com`) - fine for now,
  revisit if a real domain is bought later.
- Still no automated backups beyond whatever Supabase's free tier
  includes by default - same open item ADR 0032 already flagged.

## Future Implications

- If a Hostinger VPS (or any VPS) becomes available later, ADR 0032's
  Docker Compose files are still a reasonable reference for that path -
  they were removed from the repo, not conceptually wrong, just not
  currently usable.
- Moving to a paid Render/Supabase tier later to avoid cold starts and
  auto-pausing is a config change (dashboard plan upgrade), not a
  re-architecture.
- If the frontend ever needs to move off Hostinger's static hosting
  (e.g. for SSR), it could run on Render too, alongside the API, using
  the existing root `Dockerfile`.
