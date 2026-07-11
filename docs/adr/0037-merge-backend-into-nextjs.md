# 0037: Merge the Backend into Next.js (Retire apps/api)

Date: 2026-07-11

Status: Accepted

## Problem

The backend (`apps/api`, NestJS, deployed on Render) and frontend
(`apps/web`, Next.js, deployed on Hostinger) were two separate services
bridged only by `NEXT_PUBLIC_API_URL`/`CORS_ORIGIN` and a cross-origin
`fetch`. The user suspected this split was a speed bottleneck (most likely
Render's free-tier cold start after ~15 minutes idle) and, independently of
that, wanted a single unified app - easier to reason about, one deployment,
and a better foundation for eventually wrapping it as a packaged app.

## Decision

Port the entire NestJS backend (~4,400 lines across 14 domains: auth incl.
Google OAuth, houses/invitations, tasks, chat, projects, clients, comments,
crews, calendar, time-entries, analytics, notifications, workspace, health)
into Next.js Route Handlers inside `apps/web`, delete `apps/api` entirely,
and decommission Render - one app, one deployment, one origin.

Two alternatives were considered and rejected:

- **Redeploy `apps/api` as a second persistent Node process on Hostinger,
  unchanged.** Smaller effort, but leaves two codebases/frameworks running
  side by side - explicitly not what the user wanted ("keeping it all in
  one place in one app").
- **A custom `server.js` mounting the NestJS app as Express middleware
  inside the same process** (`app.use('/api/v1', nestExpressInstance)`
  alongside Next's own request handler). Near-zero rewrite, but a
  non-standard entry point - exactly the kind of fragile custom-server
  setup that already caused a real Hostinger incident (ADR 0034's missing
  Entry File postmortem). Full Route Handlers is more work up front but
  uses the standard `next build`/`next start` path already proven to
  deploy cleanly on this Hostinger account.

This was executed as one continuous migration (not checkpointed module-by-
module, per explicit instruction), verified fully locally before any
deployment change.

## What changed

**New shared server-side library**, `apps/web/src/server/`:

- `prisma.ts` - a dev-hot-reload-safe `PrismaClient` singleton, replacing
  Nest's DI-managed `PrismaService`.
- `http.ts` - `AppException` (now a plain `Error` subclass, not
  `HttpException`), `HttpStatus` constants, `withRoute`/`withParamsRoute`
  (wrap a handler's return value as `{ data }` and any thrown
  `AppException` as `{ error: { code, message, requestId } }` - replacing
  the global `HttpExceptionFilter`), `withPaginatedRoute`/
  `withPaginatedParamsRoute` (for the handful of list endpoints that
  return a `Page<T>` shape - `{ data, page }` - directly as the response
  body rather than nested under `data`, matching what the original
  controllers did), and `validateDto` (wraps `class-transformer`'s
  `plainToInstance` + `class-validator`'s `validate()` with
  `whitelist`/`forbidNonWhitelisted`, reproducing `ValidationPipe`'s
  behavior without Nest).
- `pagination.ts` - ported verbatim (already Nest-independent).
- `env.ts` - `getEnv`/`getOptionalEnv`/`requireEnv`, replacing
  `ConfigService.get`/`getOrThrow`.
- One folder per domain (`auth/`, `organizations/`, `tasks/`, `chat/`,
  `projects/`, `clients/`, `comments/`, `crews/`, `calendar/`,
  `time-entries/`, `analytics/`, `notifications/`, `workspace/`), each
  holding a ported service (a plain class instantiated once as a module-
  level singleton, e.g. `export const authService = new AuthService()`,
  with `@Injectable()` and constructor DI dropped in favor of a
  `private readonly prisma = prisma` field and direct imports of sibling
  services) and its DTOs (copied unchanged - `class-validator`/
  `class-transformer` decorators work standalone without a Nest runtime).

**Route handlers**, `apps/web/src/app/api/v1/**/route.ts` - one file per
former controller method group, mapping 1:1 to the old paths via Next's
folder-based dynamic segments (`[houseId]`, `[taskId]`, `[token]`, etc.)
instead of Nest's `@Param()`. Each auth-required route calls
`requireUser(request)` (a new `server/auth/require-user.ts`, replacing
`JwtAuthGuard` + `@CurrentUser()` - reads the `Authorization` header,
verifies the JWT, throws the same `401 unauthenticated` `AppException` on
failure). JWT signing/verification switched from `@nestjs/jwt`'s
`JwtService` to the plain `jsonwebtoken` package directly (`server/auth/
jwt.ts`) - `@nestjs/jwt` is a thin wrapper not worth keeping once there's
no Nest DI container to register it with.

**Google OAuth's cookie handling** moved from `cookie-parser` +
Express's `res.cookie()`/`req.cookies` to `NextResponse`'s built-in
`.cookies.set()` and `NextRequest`'s `.cookies.get()` - same 5-minute
`httpOnly`/`sameSite=lax` state cookie, different API. The OAuth
redirect's target URLs (`/login?error=...`, `/auth/callback?...`) switched
from building an absolute URL out of the `CORS_ORIGIN` env var to
`new URL(path, request.url)`, since the API and frontend now share an
origin - `CORS_ORIGIN` and `enableCors()` were deleted entirely, and the
Google Cloud Console OAuth client's authorized redirect URI needed
updating from `http://localhost:4000/api/v1/auth/google/callback` to
`http://localhost:3000/...` (and correspondingly for the live URL once
deployed).

**Frontend wiring**: `apps/web/src/lib/api/client.ts`'s `API_BASE_URL`
changed from `NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"` to a
hardcoded relative `"/api/v1"`; `buildUrl()` now builds a relative
path+search string (via a throwaway `"http://localhost"` base purely to
get `URL`'s query-string encoding, then discarding the origin) instead of
an absolute URL, so requests resolve same-origin regardless of what host
the app is actually served from. `auth-social-providers.tsx`'s Google
link switched to the same relative base. No other frontend file needed
changes - the OAuth callback page already just read tokens from a
redirect's query string, which works identically same-origin.

**Dependencies added to `apps/web`**: `@fylmico/database` (workspace),
`argon2`, `class-validator`, `class-transformer`, `jsonwebtoken` (+
`@types/jsonwebtoken`), `reflect-metadata`. No `@nestjs/*` packages, no
`cookie-parser`, no `rxjs`. `apps/web/tsconfig.json` gained
`experimentalDecorators`/`emitDecoratorMetadata` (needed for
`class-validator`'s decorators; Next.js's SWC compiler reads these same
tsconfig flags to enable legacy decorator transforms) - safe repo-wide
since no existing file used decorators before.

**`packages/database` is untouched** - schema, migrations, and the
generated client are unchanged; only its consumer changed from `apps/api`
to `apps/web`.

**Deleted**: `apps/api` entirely (all NestJS source, `Dockerfile`,
`.env.example`). **Updated**: root `package.json` (removed `apps/api` from
`workspaces`, removed `dev:api`/`build:api` scripts, `dev`/`build` now
build `@fylmico/database` first since `apps/web` depends on it directly),
root `Dockerfile` (now also copies and builds `packages/database` before
building `apps/web`, since the earlier deps-only-copy-web-package.json
setup didn't know about the new workspace dependency),
`docker-compose.yml` (removed the `api` service, added `DATABASE_URL` to
`web`), `.claude/launch.json` (removed the `api` launch config), and both
`.env.example` files (merged `apps/api`'s variables in, dropped
`CORS_ORIGIN`/`API_PORT`, fixed `GOOGLE_CALLBACK_URL`'s port from 4000 to
3000).

## Alternatives considered for the porting pattern itself

- Keep NestJS's `@Injectable()`/constructor-DI shape and hand-roll a
  minimal DI container inside Next.js. Rejected: adds a whole abstraction
  layer to solve a problem (constructor injection) that a plain module-
  level singleton (`export const xService = new XService()`) already
  solves for this app's actual dependency graph, which is simple
  (services depend on `prisma` and on each other directly, no need for
  interface-based swapping or test-time mocking via DI).
- Switch validation from `class-validator` to `zod` (more idiomatic for a
  Next.js codebase). Rejected for this pass: every existing DTO already
  worked, decorator-based validation, and switching validators would have
  meant rewriting all ~25 DTO files by hand instead of copying them
  unchanged - a larger, riskier diff for no functional gain.

## Tradeoffs

Benefits:

- One deployment, one origin - no `CORS_ORIGIN`/`NEXT_PUBLIC_API_URL`
  seam to keep in sync, no cross-origin cookie/CORS complexity.
- Eliminates whatever portion of the reported slowness was Render's
  free-tier cold start, since there's no longer a second service to spin
  up on demand - Hostinger's Web App hosting is already a persistent Node
  process (ADR 0034), so the merged app inherits that.
- Smaller dependency footprint at the framework level: no `@nestjs/*`,
  `cookie-parser`, or `rxjs` - `class-validator`/`class-transformer`/
  `argon2`/`jsonwebtoken` are used directly rather than through Nest's
  wrappers around them.
- One `npm run build`/`typecheck`/`lint`/`format:check` surface instead of
  two per-workspace ones to keep passing.

Costs:

- This was a large, mechanical rewrite (~4,400 lines touched) - real risk
  of a subtle behavior change slipping through despite the module-by-
  module typecheck passes and the full live-verification pass (every
  domain re-tested via curl and one real in-browser walkthrough) done
  before cutover.
- The Google Cloud Console OAuth client's authorized redirect URIs need a
  one-time update (port 4000 → 3000 locally; the live URL once redeployed)
  - a manual, external step outside this repo.
- The root `Dockerfile`/`docker-compose.yml` full-stack path is now more
  complex (must build `packages/database` before `apps/web`) - untested
  against a real Docker build in this pass since Hostinger's native Web
  App hosting (the actual production path) doesn't use this Dockerfile at
  all; only the plain `npm run build` path (which Hostinger does use) was
  verified end-to-end, including via the actual standalone production
  server (`node server.js`) hitting a real database.

## Future Implications

- Render can now be decommissioned by the user (external account action,
  not something this repo change does by itself).
- Any future domain module follows the same pattern: a service file under
  `server/<domain>/`, DTOs under `server/<domain>/dto/`, route handlers
  under `app/api/v1/<path>/route.ts` using `withRoute`/`withParamsRoute`.
- If this app is later wrapped as a packaged/container app (the user's
  stated longer-term goal), there's now only one process to package
  instead of two.
