# Hostinger Deployment

## Status

Accepted Sprint 0 deployment baseline.

## Deployment Modes

Fylmico supports two Hostinger deployment modes.

Use **Static Git deployment** if Hostinger asks for a build command and publish
directory. This is the safest Sprint 0 mode because the current site has no
server-only features.

Use **Node.js application deployment** only if Hostinger asks for a startup file
or process command.

Do not deploy from `apps/web` in either mode. The repository root contains the
workspace lockfile, root scripts, shared configuration, Docker files, CI
configuration, documentation, and deployment entries.

## Static Git Deployment Settings

Use these settings when Hostinger asks for a publish directory:

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
npm run build:hostinger
```

Publish directory:

```text
dist/hostinger
```

This produces:

```text
dist/hostinger/index.html
```

If the deployment is currently returning HTTP 403 after a successful build, this
is the mode to use first.

The repository also includes a root `.htaccess` fallback for Hostinger plans
that serve `public_html` from the repository root even after the build creates
`dist/hostinger`. It rewrites `/` to `dist/hostinger/index.html` and maps
`/_next/*` asset requests to `dist/hostinger/_next/*`.

## Node.js Application Settings

Use these settings only when Hostinger asks for a startup file or process
command:

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

For static Git deployment, `npm run build:hostinger` creates a plain static
export at `dist/hostinger`.

## Docker

Docker files do not affect Hostinger Node.js Git deployment unless the hosting
plan is explicitly configured to build with Docker. They are retained for VPS
and container deployment paths.

## 403 Forbidden Checklist

A successful build can still return HTTP 403 when Hostinger is serving a
directory that does not contain an `index.html`, or when the domain is attached
to a static website deployment while the repo only produced a Node.js standalone
server.

Check:

- If using static Git deployment, the build command is `npm run
build:hostinger`.
- If using static Git deployment, the publish directory is `dist/hostinger`.
- If using Node.js deployment, the start command is `npm start`.
- If using Node.js deployment, the startup file is `server.js` if Hostinger asks
  for one.
- The repository root is `/`, not `apps/web`.
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

For the Hostinger static export:

```bash
npm run build:hostinger
```

Then verify:

```text
dist/hostinger/index.html
```
