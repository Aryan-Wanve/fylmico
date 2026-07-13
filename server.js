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

// Applies any migrations committed but not yet run against DATABASE_URL.
// Runs on every boot (not just fresh deploys) since Hostinger can restart
// the process without a new push; prisma migrate deploy only applies
// pending migrations, so a no-op run is fast and safe.
try {
  console.log("[migrate] applying pending database migrations...");
  execFileSync("npx", ["prisma", "migrate", "deploy", "--schema", schemaPath], {
    stdio: "inherit",
    cwd: __dirname,
    shell: true
  });
  console.log("[migrate] database schema is up to date.");
} catch (error) {
  console.error(
    "[migrate] database migration failed - refusing to start the server."
  );
  console.error(error.message);
  process.exit(1);
}

require(standaloneServerPath);
