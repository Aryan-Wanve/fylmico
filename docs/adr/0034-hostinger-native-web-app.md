# 0034: Hostinger Native Web App, Not a Static Export

Date: 2026-07-11

Status: Accepted, supersedes the frontend half of ADR 0032

## Problem

ADR 0032 assumed Hostinger's site used "static Git deployment" - a mode
with no build step of its own, requiring `index.html`/`_next/*` to be
pre-built and committed to the repository root. That assumption was
wrong for this account. Live investigation of the Hostinger dashboard
(Deployments tab) showed a **"Web App"** card, "Connected with GitHub" -
Hostinger's own managed Node.js hosting, which builds and runs
`apps/web` directly from the repo on every push with no help needed.

Because the wrong assumption was baked into `.github/workflows/
deploy-hostinger.yml` and `scripts/build-hostinger-static.mjs`, two real
incidents followed once that workflow started running automatically -
plus a third, separate misconfiguration that took longest to find:

1. **A 403 on every route past the homepage.** The static-export
   mirror's per-route folders (e.g. `login/`, containing only Next.js
   prefetch-cache `.txt` files - no `index.html`) sat at the repository
   root alongside a `.htaccess` with Apache-style directory rewrite
   rules from the same era. Hostinger's edge (`hcdn`) apparently serves
   any static file it finds at the deployment root directly, falling
   back to `403` when a requested path has no match - `/` happened to
   match the leftover `index.html` and returned real-looking content,
   which is what made this look like "the app works, just one route is
   broken" rather than what it actually was (see point 3).
2. **A production data-loss bug.** `build-hostinger-static.mjs` deletes
   every repository-root entry not on an explicit allowlist before each
   rebuild, to guarantee stale route files never linger. `packages` was
   missing from that allowlist. One automated run wiped
   `packages/database`'s entire source (Prisma schema, service files,
   `package.json`) and committed the deletion straight to `main`
   (`eced150`).
3. **The actual Node.js app had never been running at all.** After
   removing the static-export files, _every_ route started returning
   `403` (not just `/login`), and Hostinger's Runtime Logs showed zero
   requests ever reaching the process. The Web App's **Entry file**
   setting (Deployments -> Settings, "Node.js entry file that starts
   your application") was blank the entire time - meaning `npm start`
   was never actually invoked, and the "working" homepage before this
   point was hcdn serving the leftover static `index.html` directly,
   never the real app. Setting Entry file to `server.js` (this repo's
   existing standalone-server entry point) was the fix that actually
   made the site work. The Web App's own **Environment Variables**
   section (separate from GitHub's repo variables, and separate from
   Render's) was also empty - `NEXT_PUBLIC_API_URL` had to be added
   there directly for the live frontend to reach the live API.

## Decision

- **Remove the static-export pipeline entirely**: delete
  `.github/workflows/deploy-hostinger.yml` and
  `scripts/build-hostinger-static.mjs`. Hostinger's own GitHub
  integration is the complete CD pipeline for the frontend - nothing
  else is needed, and the custom workflow was actively harmful once
  running against a target it wasn't designed for.
- **Delete every static-export artifact previously committed to the
  repository root**: `index.html`, `404.html`, `_next/`, `.htaccess`,
  every per-route `.html`/`.txt` file and per-route folder (`login/`,
  `analytics/`, `bookings/`, etc.), and the stray `images/` mirror of
  `apps/web/public/images`. None of it is read by Hostinger's actual
  Node.js hosting; it was only ever shadowing the real app's routes.
- **Restore `packages/database`** from the last good commit
  (`bc1ff37`, immediately before the deletion), with its `tsconfig.json`
  re-updated to the `node16` module resolution fix from ADR (the
  TypeScript deprecation fix) that landed after that commit. Verified
  with a full local `build:api`/`typecheck`/`lint` pass.
- **Set the Web App's Entry file to `server.js`** (Deployments ->
  Settings -> Build and output settings) so Hostinger actually starts
  the standalone Next.js server on deploy. Output directory stays blank
  - this is a running process, not a static folder to copy.
- **Added `NEXT_PUBLIC_API_URL` directly in the Web App's own
  Environment Variables section**, pointing at the live Render API
  (`https://fylmico-api.onrender.com/api/v1`) - this setting is scoped
  to the Hostinger deployment itself, unrelated to any GitHub Actions
  repository variable.
- **Rewrite `docs/hostinger-deployment.md`** to describe what's actually
  running (Hostinger's native Web App: `npm install` -> `npm run build`
  -> `npm start` -> `node server.js` -> the Next.js standalone server),
  explicitly warn against recreating the removed static-export
  machinery, and document the Entry file / Environment Variables
  settings as required one-time configuration for this Hostinger
  product.
- **Verified live**: after all three fixes, `/login` and `/signup`
  return real Next.js responses (not Apache 403s), and the live site
  can reach the live Render API.

## Alternatives

- Keep the static-export workflow but just fix its two bugs (add
  `packages` to the allowlist, remove the stray `login/`-style
  directories). Rejected: the workflow was solving a problem this
  Hostinger account doesn't have. Even bug-free, it would keep
  committing bot-authored rebuild commits and root-level build
  artifacts for no reason, adding noise and risk (as this incident
  showed) for zero benefit over Hostinger's own native integration.
- Leave the deleted static files in place since the live site "worked"
  for `/` before this fix. Rejected: `/` happening to work was an
  accident of the export's `index.html` matching the real homepage
  content closely enough to look fine - every other route was already
  broken (confirmed: `/login/` 403'd), so "working" was an illusion
  that would have surfaced the same problem on any route a user
  actually tried to use.

## Tradeoffs

Benefits:

- The live site's routing bug is fixed - confirmed via direct `curl`
  checks against the previously-403ing path.
- `packages/database` is restored and the class of bug that deleted it
  (an incomplete allowlist that silently wipes unlisted directories) no
  longer exists in the repository at all, because the script that
  contained it is gone.
- One less moving part: the frontend's entire CD story is now "Hostinger
  watches `main` on its own" - nothing to configure, maintain, or debug
  in GitHub Actions for the frontend half of deployment.

Costs:

- Two ADRs (0032's frontend half, superseded here) and the associated
  workflow/script represent real work that turned out to target the
  wrong deployment model - a genuine wasted-effort cost from not
  confirming which Hostinger product was actually in use before building
  automation around it.
- If this Hostinger plan is ever downgraded to a tier without native
  Node.js app hosting, a real static-export pipeline would need to be
  rebuilt from scratch - carefully, with `packages/` (and any future
  top-level workspace) protected from day one.

## Future Implications

- Before building deploy automation around any hosting platform in the
  future, confirm what it actually does (check its own dashboard/docs
  for the specific account/plan) before assuming a deployment model from
  generic documentation.
- If a static-export need genuinely arises later, the removed script's
  logic (build, then mirror `apps/web/out` into a target directory) is
  still visible in git history at `bc1ff37` if a starting point is
  wanted - but it must not become a root-directory-wiping cleanup step
  without a complete, correct allowlist.
