# Hostinger Deployment

## Status

Accepted Sprint 0 deployment baseline.

## Deployment Mode

Deploy Fylmico as a Hostinger Node.js application from the repository root.

Do not deploy from `apps/web` for the current foundation. The repository root
contains the workspace lockfile, root scripts, shared configuration, Docker
files, CI configuration, documentation, and the production startup entry.

## Required Hostinger Settings

Repository root:

```text
/
```

Install command:

```bash
npm install
```

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Startup file, when Hostinger asks for one:

```text
server.js
```

Node version:

```text
22.13.0 or newer
```

## Why Root Deployment Is Required

Fylmico uses npm workspaces. The runnable Next.js app lives in `apps/web`, but
the repository root owns:

- `package-lock.json`
- npm workspace configuration
- root production scripts
- lint and format configuration
- CI configuration
- deployment entry file
- project documentation

Deploying from `apps/web` bypasses the root command surface and can cause
Hostinger to build one folder while serving or starting another.

## Production Runtime

The Next.js app uses:

```ts
output: "standalone";
```

The production runtime is not `next start`. After `npm run build`, the runnable
server is:

```text
apps/web/.next/standalone/apps/web/server.js
```

The root `server.js` file exists as a stable Hostinger entry point and delegates
to that generated standalone server.

## Static Assets

Next.js standalone output does not automatically include `.next/static` or
`public`. The root `postbuild` script runs:

```bash
node scripts/sync-next-standalone-assets.mjs
```

This copies required assets into the standalone runtime folder after every root
build.

## Docker

Docker files do not affect Hostinger Node.js Git deployment unless the hosting
plan is explicitly configured to build with Docker. They are retained for VPS
and container deployment paths.

## 403 Forbidden Checklist

A successful build can still return HTTP 403 when Hostinger is serving the
domain from a static directory instead of routing traffic to the Node.js
process.

Check:

- The application is configured as a Node.js application, not a static website.
- The repository root is `/`, not `apps/web`.
- The start command is `npm start`.
- The startup file is `server.js` if Hostinger asks for one.
- Hostinger regenerated its Node.js routing files after the latest deployment.
- The domain is attached to the Node.js app.
- There is no stale `public_html` deployment masking the Node.js app.

## Expected Local Verification

Run:

```bash
npm install
npm run build
npm start
```

Then open:

```text
http://localhost:3000
```
