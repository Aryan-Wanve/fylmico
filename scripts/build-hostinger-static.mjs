import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(__filename), "..");
const webRoot = path.join(repositoryRoot, "apps", "web");
const staticOutput = path.join(webRoot, "out");
const hostingerOutput = path.join(repositoryRoot, "dist", "hostinger");
const rootStaticArtifacts = [
  "_next",
  "_not-found",
  "index.html",
  "index.txt",
  "404.html",
  "_not-found.html",
  "_not-found.txt",
  "__next._full.txt",
  "__next._head.txt",
  "__next._index.txt",
  "__next._tree.txt",
  "__next.__PAGE__.txt"
];
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

await rm(hostingerOutput, { force: true, recursive: true });
await rm(staticOutput, { force: true, recursive: true });
await Promise.all(
  rootStaticArtifacts.map((artifact) =>
    rm(path.join(repositoryRoot, artifact), { force: true, recursive: true })
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
