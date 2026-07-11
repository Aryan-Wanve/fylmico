# 0032: Continuous Deployment to Hostinger

Date: 2026-07-11

Status: Partially superseded by ADR 0033 - the frontend half (Hostinger
static rebuild, `.github/workflows/deploy-hostinger.yml`) is still
accepted and unchanged. The backend half (VPS + Docker Compose + SSH
deploy) turned out to not be viable - there was no VPS available after
all - and is replaced by ADR 0033 (Supabase Postgres + Render). This
document is kept for its problem-statement context and the still-valid
frontend decision; do not follow its VPS setup steps.

## Problem

The live Hostinger site was showing an app roughly two weeks out of date.
The cause: Hostinger's static Git deployment serves whatever
`index.html`/`_next/*` files are committed at the repository root - it
does not run its own build. Those root files are a checked-in mirror of
`npm run build:hostinger`'s output (`docs/hostinger-deployment.md`), and
that command had only ever been run and committed by hand. Once feature
work resumed without anyone repeating that manual step, GitHub kept
advancing while the committed static export - and therefore the live
site - silently froze at the last manual rebuild.

Separately, no backend was deployed anywhere. Every feature built this
session (auth, houses, tasks, projects, crews, messages, calendar,
analytics/time-tracking) talks to a real NestJS API + Postgres - none of
that has ever run outside `docker compose up -d postgres` on a
developer's own machine. Fixing only the stale-static-export problem
would still leave the live site's login/signup/every real page
non-functional for actual visitors.

## Decision

Two independent, automatic pipelines, matching the two separate Hostinger
resources already in use (a static-hosting site, and a VPS):

### 1. Frontend: keep the committed static export fresh

`.github/workflows/deploy-hostinger.yml` runs on every push to `main`:
installs deps, runs `npm run build:hostinger` (reading
`NEXT_PUBLIC_API_URL` from a repository variable so the export points at
the real API), and - only if the output actually differs from what is
committed - pushes a `chore(deploy): ... [skip deploy]` commit updating
the root static files. Hostinger's existing auto-deploy (if enabled on
the site) then serves that commit like any other push. The `[skip
deploy]` marker plus a `contains(...)` guard on the job stops this from
re-triggering itself in a loop - the second run after the bot's own
commit rebuilds identical output and pushes nothing.

### 2. Backend: deploy the API + Postgres to the VPS on every push

`.github/workflows/deploy-vps.yml` runs on every push to `main`, SSHs
into the VPS (`appleboy/ssh-action`, using `VPS_HOST`/`VPS_USER`/
`VPS_SSH_KEY` repo secrets), and runs `deploy/deploy.sh` there, which:

1. `git fetch`/`reset --hard` to the latest `main` in a checkout already
   present on the server.
2. `docker compose -f docker-compose.prod.yml --env-file .env up -d
--build` (new `docker-compose.prod.yml` - API + Postgres only, no
   frontend container, matching the split with Hostinger's static
   hosting for the frontend).
3. `docker compose exec api npx prisma migrate deploy` so schema changes
   ship automatically alongside code.
4. `docker image prune -f` to avoid unbounded disk growth from rebuilds.

`docker-compose.prod.yml` differs from the existing dev
`docker-compose.yml` in three ways that matter for a real server: secrets
come from an untracked `.env` file (`deploy/api.env.example` documents
the shape) instead of hardcoded dev values, every service has
`restart: unless-stopped`, and Postgres has no host port mapping at all
(API reaches it over the Docker-internal network only; the API itself is
bound to `127.0.0.1:4000`, not `0.0.0.0`, so it's reachable only through
a reverse proxy, not directly from the internet).

### One-time VPS setup (must be done manually - infra/credentials this

tooling cannot touch)

1. **Install Docker** on the VPS if not already present
   (`curl -fsSL https://get.docker.com | sh`).
2. **Clone the repo once**: `git clone <repo-url> /opt/fylmico`.
3. **Create the secrets file**: copy `deploy/api.env.example` to
   `/opt/fylmico/.env` and fill in a generated `POSTGRES_PASSWORD`
   (`openssl rand -hex 32`), `JWT_ACCESS_SECRET`
   (`openssl rand -hex 64`), and `CORS_ORIGIN` (the Hostinger frontend's
   real domain, e.g. `https://fylmico.com`).
4. **Generate a deploy SSH key pair** (on your own machine, not the
   VPS): `ssh-keygen -t ed25519 -C "github-actions-deploy" -f
fylmico_deploy_key -N ""`. Append `fylmico_deploy_key.pub` to
   `~/.ssh/authorized_keys` on the VPS for the deploy user.
5. **Add GitHub repo secrets** (Settings -> Secrets and variables ->
   Actions): `VPS_HOST` (the VPS's IP or hostname), `VPS_USER` (the SSH
   user), `VPS_SSH_KEY` (the private key generated above, full
   contents).
6. **Add a GitHub repo variable**: `NEXT_PUBLIC_API_URL` set to
   `https://api.<your-domain>` (or wherever the API subdomain will
   live) - this makes the Hostinger static-export workflow bake in the
   real API URL instead of falling back to `localhost:4000`.
7. **Point DNS**: an A record for the API subdomain (e.g.
   `api.fylmico.com`) at the VPS's IP.
8. **Configure Nginx + SSL on the VPS**: copy
   `deploy/nginx-api.conf.example` to
   `/etc/nginx/sites-available/fylmico-api`, fill in the real subdomain,
   symlink into `sites-enabled`, then run
   `certbot --nginx -d api.<your-domain>` to provision SSL.
9. **First deploy**: run `bash /opt/fylmico/deploy/deploy.sh` once by
   hand on the VPS to confirm it works before relying on the GitHub
   Actions workflow.

After this one-time setup, every subsequent `git push` to `main`
rebuilds and redeploys both halves automatically with no further manual
steps.

## Alternatives

- Containerize the frontend on the VPS too (using the existing root
  `Dockerfile`, standalone Next server) instead of keeping Hostinger's
  static hosting. Rejected: the static Hostinger site is already paid for
  and configured with its own domain; splitting frontend (static
  hosting) from backend (VPS) reuses both existing Hostinger resources
  rather than migrating the frontend and paying for/managing one more
  thing on the VPS.
- Rebuild the Hostinger static export on a schedule (cron) instead of on
  every push. Rejected: a push-triggered rebuild is simpler to reason
  about ("did I push? then it's live shortly after") and doesn't risk a
  window where a schedule hasn't caught up yet.
- Use a hosted CD platform (Railway/Render's built-in GitHub deploys)
  for the backend instead of a VPS + SSH. Rejected per the explicit
  choice to use the Hostinger VPS that's already available, rather than
  adding a new paid service.
- Skip database migrations in the deploy script and run them manually.
  Rejected: every prior module this session shipped a migration
  alongside its code; a deploy pipeline that updates code but not schema
  would break on the very next schema-changing push.

## Tradeoffs

Benefits:

- Solves the reported problem directly: after this change, whatever is
  pushed to `main` reaches the live frontend (within one Hostinger
  auto-deploy cycle after the rebuild commit) and the live backend
  (within the SSH deploy workflow's run) with no manual step in between.
- The backend becomes real and reachable for the first time - every
  module built this session (auth, houses, tasks, projects, crews,
  messages, calendar, analytics) starts working for actual users once
  the one-time VPS setup above is completed, not just in local dev.
- Secrets stay off GitHub and off the static frontend: the VPS `.env` is
  untracked, and the frontend only ever gets the public API _URL_, never
  a credential.

Costs:

- The one-time VPS setup (steps above) requires manual, credentialed
  actions - SSH key generation, DNS, GitHub secrets, certbot - that
  cannot be automated from here and must be completed before either
  pipeline does anything useful. Until then, `deploy-vps.yml` will fail
  every run (no `VPS_HOST`/`VPS_USER`/`VPS_SSH_KEY` secrets configured
  yet) and the Hostinger rebuild will keep pointing at `localhost:4000`
  for API calls (no `NEXT_PUBLIC_API_URL` variable set yet).
- No blue-green or zero-downtime deploy - `docker compose up -d --build`
  briefly restarts the API container on every deploy.
- No automated Postgres backups yet (tracked as an open item in
  `docs/deployment.md`).
- No staging environment - every push to `main` goes straight to
  production on both halves.

## Future Implications

- Once a staging environment is wanted, both workflows would need a
  second trigger (e.g. a `staging` branch) and a second set of secrets/
  VPS path - not built now since only one environment exists.
- If the frontend ever needs server-side rendering or API routes (not
  just static export), the split with a separately-hosted static site
  stops working and the frontend would need to move onto the VPS
  alongside the API, using the root `Dockerfile` that already exists for
  that scenario.
- Postgres backups and zero-downtime deploys are the two most
  concretely-scoped gaps left before this counts as a fully mature
  production setup.
