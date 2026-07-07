import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(__filename), "..");
const webRoot = path.join(repositoryRoot, "apps", "web");
const staticOutput = path.join(webRoot, "out");
const hostingerOutput = path.join(repositoryRoot, "dist", "hostinger");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

// Everything at the repository root that is NOT this list is considered
// disposable static-export output and gets wiped before every rebuild. This
// must be an allowlist of real source/config paths (not a denylist of known
// export artifacts) so that route/asset changes in the Next.js app can never
// leave stale files behind at the repository root.
const protectedRootEntries = new Set([
  ".agents",
  ".claude",
  ".codex-remote-attachments",
  ".dockerignore",
  ".editorconfig",
  ".env",
  ".env.example",
  ".git",
  ".gitattributes",
  ".github",
  ".gitignore",
  ".htaccess",
  ".husky",
  ".npmrc",
  ".prettierignore",
  ".prettierrc.mjs",
  "AI_RULES.md",
  "Dockerfile",
  "MASTER_INDEX.md",
  "PRODUCT_PRINCIPLES.md",
  "PROJECT_SPEC.md",
  "README.md",
  "apps",
  "dist",
  "docker-compose.yml",
  "docs",
  "eslint.config.mjs",
  "node_modules",
  "package-lock.json",
  "package.json",
  "scripts",
  "server.js"
]);

await rm(hostingerOutput, { force: true, recursive: true });
await rm(staticOutput, { force: true, recursive: true });

const existingRootEntries = await readdir(repositoryRoot);
await Promise.all(
  existingRootEntries
    .filter((entry) => !protectedRootEntries.has(entry))
    .map((entry) =>
      rm(path.join(repositoryRoot, entry), { force: true, recursive: true })
    )
);

const build = spawnSync(
  npmCommand,
  ["--workspace", "@fylmico/web", "run", "build"],
  {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      NEXT_OUTPUT_MODE: "export"
    },
    shell: process.platform === "win32",
    stdio: "inherit"
  }
);

if (build.error) {
  console.error(build.error);
  process.exit(1);
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

await mkdir(path.dirname(hostingerOutput), { recursive: true });
await cp(staticOutput, hostingerOutput, { recursive: true });

const staticEntries = await readdir(staticOutput);
await Promise.all(
  staticEntries.map((entry) =>
    cp(path.join(staticOutput, entry), path.join(repositoryRoot, entry), {
      recursive: true
    })
  )
);

console.log(`Hostinger static export ready: ${hostingerOutput}`);
console.log(`Hostinger root fallback ready: ${repositoryRoot}`);
