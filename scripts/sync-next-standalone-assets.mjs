import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(__filename), "..");
const webRoot = path.join(repositoryRoot, "apps", "web");
const standaloneWebRoot = path.join(
  webRoot,
  ".next",
  "standalone",
  "apps",
  "web"
);

const copyDirectory = async (source, destination) => {
  await rm(destination, { force: true, recursive: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
};

await copyDirectory(
  path.join(webRoot, ".next", "static"),
  path.join(standaloneWebRoot, ".next", "static")
);

try {
  await copyDirectory(
    path.join(webRoot, "public"),
    path.join(standaloneWebRoot, "public")
  );
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}
