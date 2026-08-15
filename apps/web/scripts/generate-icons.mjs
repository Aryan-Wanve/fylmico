// Generates the PWA/app icon set from a small vector "F" mark, in the same
// violet used for the brand mark on the auth pages (see
// src/lib/theme-context.tsx ACCENT_VALUES.violet). Re-run after changing the
// mark or the brand colors:
//
//   node scripts/generate-icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const ACCENT = "#654cff";
const LIGHT_BG = "#f7f7fb";
const CANVAS = 96;

function fMark(fill) {
  return `
    <rect x="8" y="8" width="20" height="80" rx="10" fill="${fill}" />
    <rect x="8" y="8" width="80" height="20" rx="10" fill="${fill}" />
    <rect x="8" y="38" width="56" height="20" rx="10" fill="${fill}" />
  `;
}

function svg({ background, scale }) {
  const inset = (CANVAS * (1 - scale)) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}">
    ${background ? `<rect width="${CANVAS}" height="${CANVAS}" fill="${background}" />` : ""}
    <g transform="translate(${inset} ${inset}) scale(${scale})">
      ${fMark(ACCENT)}
    </g>
  </svg>`;
}

async function render(markup, size, outPath) {
  await sharp(Buffer.from(markup)).resize(size, size).png().toFile(outPath);
  console.log("wrote", path.relative(root, outPath));
}

async function main() {
  const iconsDir = path.join(root, "public", "icons");
  await mkdir(iconsDir, { recursive: true });

  const transparent = svg({ background: null, scale: 1 });
  await writeFile(path.join(iconsDir, "mark.svg"), transparent.trim());

  await render(transparent, 192, path.join(iconsDir, "icon-192.png"));
  await render(transparent, 512, path.join(iconsDir, "icon-512.png"));

  // Maskable icons get cropped to a circle/squircle by the OS, so the mark
  // has to sit inside the safe zone (roughly the center 80%).
  const maskable = svg({ background: LIGHT_BG, scale: 0.55 });
  await render(maskable, 512, path.join(iconsDir, "maskable-512.png"));

  // iOS renders its own rounded-square mask and doesn't like transparency.
  const apple = svg({ background: LIGHT_BG, scale: 0.7 });
  await render(apple, 180, path.join(root, "public", "apple-touch-icon.png"));

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
