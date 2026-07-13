const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const standaloneServerPath = path.join(
  __dirname,
  "apps",
  "web",
  ".next",
  "standalone",
  "apps",
  "web",
  "server.js"
);

if (!fs.existsSync(standaloneServerPath)) {
  console.error(
    "Fylmico production server was not found. Run `npm run build` before `npm start`."
  );
  console.error(`Missing file: ${standaloneServerPath}`);
  process.exit(1);
}

const schemaPath = path.join(
  __dirname,
  "packages",
  "database",
  "prisma",
  "schema.prisma"
);

// Resolve prisma's actual CLI entry point through Node's own module
// resolution (starting the search from packages/database, where it's a
// direct dependency) rather than guessing a node_modules/.bin path or
// shelling out to npx - this is immune to hoisting layout, missing shell
// binaries, and npx's own network-fetch/resolution behavior, all of
// which differ across sandboxed hosting environments.
const prismaPackageJsonPath = require.resolve("prisma/package.json", {
  paths: [path.join(__dirname, "packages", "database")]
});
const prismaCliEntry = path.join(
  path.dirname(prismaPackageJsonPath),
  require(prismaPackageJsonPath).bin.prisma
);

// Applies any migrations committed but not yet run against DATABASE_URL.
// Runs on every boot (not just fresh deploys) since Hostinger can restart
// the process without a new push; prisma migrate deploy only applies
// pending migrations, so a no-op run is fast and safe.
//
// Failure here is deliberately non-fatal: some hosting sandboxes (this
// project's shared Hostinger plan among them) restrict or throttle
// spawning subprocesses from the running Node process, so the schema
// engine binary Prisma spawns internally can fail with EAGAIN even
// though the app itself is healthy. Refusing to start the whole server
// over that would take down working routes to "fix" a migration that
// was never going to succeed in-process anyway - log loudly and keep
// booting; apply migrations out-of-band instead (see docs/deployment.md).
try {
  console.log("[migrate] applying pending database migrations...");
  execFileSync(
    process.execPath,
    [prismaCliEntry, "migrate", "deploy", "--schema", schemaPath],
    { stdio: "inherit", cwd: __dirname }
  );
  console.log("[migrate] database schema is up to date.");
} catch (error) {
  console.error(
    "[migrate] database migration failed - starting the server anyway; apply migrations manually (see docs/deployment.md)."
  );
  console.error(error.message);
}

require(standaloneServerPath);
