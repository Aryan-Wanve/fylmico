# Hostinger Deployment

## Status

Accepted per ADR 0034, superseding the static-Git-export approach in
ADR 0032, and updated per ADR 0037 (backend merged into this same Next.js
app - see that ADR for what moved and why). Confirmed live end-to-end:
this account's site uses Hostinger's native "Web App" hosting product,
connected directly to GitHub - not the manual static-Git or Node.js-Git
deployment modes this document previously assumed. Two required one-time
settings (Entry file, Environment Variables) had never been configured
and caused the site to serve `403 Forbidden` on every route until fixed -
see below.

## How It Actually Works

Hostinger's Website dashboard (Deployments tab) shows a **"Web App"**
card labeled "Connected with GitHub." This is Hostinger's own managed
Node.js hosting: it watches `main`, and on every push it runs, in a
container it manages entirely:

```bash
npm install
npm run build   # -> next build (standalone output) + postbuild asset sync
npm start       # -> node server.js -> apps/web/.next/standalone/apps/web/server.js
```

This needs **no GitHub Actions workflow at all** - Hostinger's own
integration is the entire CD pipeline for the frontend. Pushing to `main`
is sufficient; the site rebuilds and redeploys on its own within a few
minutes.

## Required One-Time Settings

Both of these live under the Web App's **Deployments -> Settings** page
and are scoped to this Hostinger deployment specifically - neither is
read from the repository or from GitHub Actions variables/secrets. A
freshly-connected Web App leaves both blank, and the site will build
successfully but serve `403 Forbidden` on every route until they're set:

- **Entry file**: `server.js`. Without this, Hostinger builds the app
  but never actually runs `npm start` - Runtime Logs will show zero
  requests ever reaching the process (not an error, just silence),
  because there's no process to reach. This is the setting that
  actually starts the standalone Next.js server described below.
- **Environment Variables** -> since ADR 0037 merged the backend into
  this same app, this is now where every backend secret lives (there's no
  separate Render service to configure anymore): `DATABASE_URL` (the
  Supabase connection string), `JWT_ACCESS_SECRET`, `JWT_ACCESS_TTL`,
  `JWT_REFRESH_TTL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GOOGLE_CALLBACK_URL` (the live URL's `/api/v1/auth/google/callback`,
  which must also be registered as an authorized redirect URI in the
  Google Cloud Console OAuth client - see ADR 0035), `RESEND_API_KEY` (a
  Resend API key - without it, `sendMail` silently falls back to logging
  emails to Runtime Logs instead of sending them, which is what happened
  in production until this was caught: verification/OTP/reset emails
  never reached real users), `MAIL_FROM` (a sender address on a domain
  verified in Resend - e.g. `Fylmico <noreply@yourdomain.com>`; doesn't
  need to be a real mailbox, just DNS-verified). `NEXT_PUBLIC_API_URL`
  no longer applies - the frontend calls its own same-origin `/api/v1`
  path now, not a separate host.

Leave **Output directory** blank - this is a running Node process, not a
static folder Hostinger copies files out of.

## What NOT To Do (and why it broke the site)

An earlier pass at this problem assumed a different, older Hostinger
deployment style - a "static Git deployment" where Hostinger just serves
whatever `index.html`/`_next/*` files are checked into the repository
root, with no build step of its own. That's not how this account's site
works, but the docs (and a `.github/workflows/deploy-hostinger.yml`
workflow) were built around that wrong assumption, and it took three
separate problems - two caused by that wrong assumption, one an
unrelated missing setting - to fully understand what was actually wrong:

1. **Stale static files partially masked the real problem.** The
   workflow ran `npm run build:hostinger`, mirroring a static export
   into the repository root and committing it. Hostinger's edge
   (`hcdn`) apparently serves any static file it finds there directly,
   independent of whether the real Node app is even running - so `/`
   returned a real-looking page (matching the leftover `index.html`)
   while deeper routes like `/login` 403'd (their leftover export
   folders had no `index.html` inside, just Next.js prefetch-cache
   files). This looked like "the app mostly works, one route is
   broken," which delayed finding problem 3 below.
2. **The same script deleted real source code.** Its cleanup step wipes
   every repository-root entry not on an explicit allowlist before each
   rebuild - and `packages/` was missing from that allowlist. One
   automated run committed the deletion of `packages/database`'s entire
   source (Prisma schema, service files, `package.json`) straight to
   `main`.
3. **The actual Node app had never been running at all.** Once the
   stale static files were removed, _every_ route started returning
   `403`, and Runtime Logs showed zero requests ever reaching the
   process. The Entry file setting (see above) had simply never been
   set - the "working" homepage the whole time had been hcdn serving a
   static leftover file, never the real app.

Both the workflow and the script have been removed (see ADR 0034), every
leftover static-export artifact at the repository root has been deleted,
and the Entry file / Environment Variables settings above have been
configured. **Do not recreate the static-export workflow.** If a future
Hostinger plan genuinely needs a static export (a plain "publish
directory" style deployment with no build step of its own), design that
fresh, with `packages/` correctly protected from the start, rather than
reviving the removed script.

## Production Runtime

The Next.js app uses:

```ts
output: "standalone";
```

After `npm run build`, the runnable server is:

```text
apps/web/.next/standalone/apps/web/server.js
```

The root `server.js` file is the stable entry point - it's what the
Entry file setting above points Hostinger at (`npm start` -> `node
server.js`), and it delegates to that generated standalone server.

Next.js standalone output does not automatically include `.next/static`
or `public`. The root `postbuild` script
(`scripts/sync-next-standalone-assets.mjs`) copies those into the
standalone runtime folder after every build - this still runs as part of
Hostinger's own `npm run build` step, no separate action needed.

## Verifying a Deployment

From Hostinger's dashboard for the site:

- **Dashboard** tab: shows the last deployment's state (`Completed`),
  commit, and whether the app is `Running`.
- **Deployments** tab: full history of every push and its build log.
- **Runtime logs** tab: what the running Node process is actually
  logging. If this shows "no logs" / "0 issues, 0 errors" even after
  visiting the live site, that's a sign requests aren't reaching the
  process at all - check the Entry file setting first.

## Expected Local Verification

```bash
npm install
npm run build
npm start
```

Then open `http://localhost:3000`.
