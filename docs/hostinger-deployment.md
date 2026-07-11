# Hostinger Deployment

## Status

Accepted per ADR 0034, superseding the static-Git-export approach in
ADR 0032. Confirmed live: this account's site uses Hostinger's native
"Web App" hosting product, connected directly to GitHub - not the manual
static-Git or Node.js-Git deployment modes this document previously
assumed.

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

## What NOT To Do (and why it broke the site)

An earlier pass at this problem assumed a different, older Hostinger
deployment style - a "static Git deployment" where Hostinger just serves
whatever `index.html`/`_next/*` files are checked into the repository
root, with no build step of its own. That's not how this account's site
works, but the docs (and a `.github/workflows/deploy-hostinger.yml`
workflow) were built around that wrong assumption.

That workflow ran `npm run build:hostinger`, a script that build a plain
static export of the Next.js app and mirrored it into the repository
root, then committed it. Two real problems resulted:

1. **It broke real routing.** The static export's per-route folders
   (e.g. `login/` containing only Next.js prefetch-cache files, no
   `index.html`) sat at the repository root alongside `.htaccess`
   rewrite rules from the same era. Hostinger's edge (`hcdn`) redirects
   `/login` -> `/login/`, found the leftover `login/` directory with no
   index file, and returned `403 Forbidden` - even though the real,
   live Node.js app underneath would have served that route correctly
   on its own.
2. **It deleted real source code.** The script's cleanup step wipes
   every repository-root entry not on an explicit allowlist before
   rebuilding - and `packages/` was missing from that allowlist. One
   automated run committed the deletion of `packages/database`'s entire
   source (Prisma schema, service files, `package.json`) straight to
   `main`.

Both the workflow and the script have been removed (see ADR 0034), and
every leftover static-export artifact at the repository root
(`index.html`, `_next/`, per-route `.html`/`.txt` files and folders,
`.htaccess`) has been deleted. **Do not recreate any of this.** If a
future Hostinger plan genuinely needs a static export (a plain "publish
directory" style deployment with no build step of its own), design that
fresh, with `packages/` correctly protected from the start, rather than
reviving the removed script.

## Environment Variables

Set in Hostinger's dashboard (Website -> Environment variables), not in
a committed file:

- `NEXT_PUBLIC_API_URL`: the live Render API's base URL plus `/api/v1`
  (see `docs/adr/0033-supabase-render-backend.md`), e.g.
  `https://fylmico-api.onrender.com/api/v1`.

## Production Runtime

The Next.js app uses:

```ts
output: "standalone";
```

After `npm run build`, the runnable server is:

```text
apps/web/.next/standalone/apps/web/server.js
```

The root `server.js` file is the stable entry point Hostinger's "Web
App" hosting starts (`npm start` -> `node server.js`), and it delegates
to that generated standalone server.

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
  logging (has occasionally failed to load in Hostinger's own UI -
  a dashboard bug, not a sign the app is down).

## Expected Local Verification

```bash
npm install
npm run build
npm start
```

Then open `http://localhost:3000`.
