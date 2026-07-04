import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outDir = path.join(
  process.cwd(),
  "apps",
  "web",
  "public",
  "images",
  "login"
);

const assets = {
  "brand-mark.png": `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="96" height="96" rx="24" fill="none"/><path d="M23 20h47c5.2 0 9.4 4.2 9.4 9.4S75.2 38.8 70 38.8H46.2v10.8h16.5c5.2 0 9.4 4.2 9.4 9.4s-4.2 9.4-9.4 9.4H46.2V77c0 5.2-4.2 9.4-9.4 9.4s-9.4-4.2-9.4-9.4V68.4H23c-5.2 0-9.4-4.2-9.4-9.4s4.2-9.4 9.4-9.4h4.4V38.8H23c-5.2 0-9.4-4.2-9.4-9.4S17.8 20 23 20Z" fill="url(#g)"/><defs><linearGradient id="g" x1="14" x2="80" y1="18" y2="84" gradientUnits="userSpaceOnUse"><stop stop-color="#7C67FF"/><stop offset="1" stop-color="#5540E8"/></linearGradient></defs></svg>`,
  "calendar.png": `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="13" y="15" width="70" height="70" rx="18" fill="white"/><rect x="13" y="15" width="70" height="70" rx="18" stroke="#E9E8F9" stroke-width="3"/><path d="M31 26v9M65 26v9M26 43h44M30 35h36a7 7 0 0 1 7 7v23a7 7 0 0 1-7 7H30a7 7 0 0 1-7-7V42a7 7 0 0 1 7-7Z" stroke="#6552FF" stroke-width="5" stroke-linecap="round"/><path d="M35 53h5M47 53h5M59 53h5M35 64h5M47 64h5" stroke="#6552FF" stroke-width="5" stroke-linecap="round"/></svg>`,
  "team.png": `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="13" y="15" width="70" height="70" rx="18" fill="white"/><rect x="13" y="15" width="70" height="70" rx="18" stroke="#E9E8F9" stroke-width="3"/><circle cx="39" cy="39" r="10" stroke="#6552FF" stroke-width="5"/><circle cx="61" cy="42" r="8" stroke="#6552FF" stroke-width="5"/><path d="M23 69c2.7-11 10.5-16.5 23.5-16.5S67.3 58 70 69" stroke="#6552FF" stroke-width="5" stroke-linecap="round"/><path d="M57 55c7.8 1.5 12.9 6.2 15.3 14" stroke="#6552FF" stroke-width="5" stroke-linecap="round"/></svg>`,
  "folder.png": `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="13" y="15" width="70" height="70" rx="18" fill="white"/><rect x="13" y="15" width="70" height="70" rx="18" stroke="#E9E8F9" stroke-width="3"/><path d="M24 36.5A7.5 7.5 0 0 1 31.5 29h14.4l7.2 8.2h19.4A7.5 7.5 0 0 1 80 44.7v19.8A7.5 7.5 0 0 1 72.5 72h-41A7.5 7.5 0 0 1 24 64.5v-28Z" stroke="#6552FF" stroke-width="5" stroke-linejoin="round"/></svg>`,
  "progress.png": `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="13" y="15" width="70" height="70" rx="18" fill="white"/><rect x="13" y="15" width="70" height="70" rx="18" stroke="#E9E8F9" stroke-width="3"/><path d="m26 67 12-15 11 10 19-31" stroke="#6552FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M63 31h8v8" stroke="#6552FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "mail.png": `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 20.5h38a4.5 4.5 0 0 1 4.5 4.5v25A4.5 4.5 0 0 1 51 54.5H13A4.5 4.5 0 0 1 8.5 50V25a4.5 4.5 0 0 1 4.5-4.5Z" stroke="#7F8498" stroke-width="4"/><path d="m12 25 20 15 20-15" stroke="#7F8498" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "lock.png": `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="28" width="40" height="27" rx="6" stroke="#7F8498" stroke-width="4"/><path d="M21 28v-7a11 11 0 0 1 22 0v7" stroke="#7F8498" stroke-width="4" stroke-linecap="round"/><path d="M32 39v7" stroke="#7F8498" stroke-width="4" stroke-linecap="round"/></svg>`,
  "eye.png": `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 32s9-15 25-15 25 15 25 15-9 15-25 15S7 32 7 32Z" stroke="#7F8498" stroke-width="4" stroke-linejoin="round"/><circle cx="32" cy="32" r="7" stroke="#7F8498" stroke-width="4"/></svg>`,
  "security.png": `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="80" height="80" rx="18" fill="white"/><rect x="8" y="8" width="80" height="80" rx="18" stroke="#E6E4FB" stroke-width="3"/><path d="M48 23 68 31v14c0 13-7.8 24.6-20 29-12.2-4.4-20-16-20-29V31l20-8Z" stroke="#6552FF" stroke-width="5" stroke-linejoin="round"/><path d="m39 48 6 6 13-14" stroke="#6552FF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "google.png": `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M85.1 49c0-2.8-.3-5.4-.7-8H49v15.1h20.3c-.9 4.8-3.6 8.8-7.6 11.5v9.5h12.3c7.2-6.6 11.1-16.3 11.1-28.1Z"/><path fill="#34A853" d="M49 86c10.3 0 19-3.4 25.3-9.1L62 67.4c-3.4 2.3-7.8 3.6-13 3.6-10 0-18.4-6.7-21.4-15.7H14.9v9.8C21.1 77.5 34 86 49 86Z"/><path fill="#FBBC05" d="M27.6 55.3A22.5 22.5 0 0 1 26.4 48c0-2.5.4-5 1.2-7.3v-9.8H14.9A37 37 0 0 0 11 48c0 6.1 1.4 11.9 3.9 17.1l12.7-9.8Z"/><path fill="#EA4335" d="M49 25c5.6 0 10.6 1.9 14.6 5.7l10.9-10.9C67.9 13.7 59.3 10 49 10 34 10 21.1 18.5 14.9 30.9l12.7 9.8C30.6 31.7 39 25 49 25Z"/></svg>`,
  "apple.png": `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><path fill="#111111" d="M65.8 50.4c-.1-10.8 8.8-16 9.2-16.2-5-7.3-12.8-8.3-15.6-8.4-6.6-.7-13 3.9-16.3 3.9-3.4 0-8.5-3.8-14-3.7-7.2.1-13.8 4.2-17.5 10.6-7.5 13-1.9 32.1 5.4 42.7 3.6 5.1 7.8 10.9 13.4 10.7 5.3-.2 7.4-3.5 13.8-3.5s8.3 3.5 14 3.4c5.8-.1 9.5-5.2 13-10.4 4.1-6 5.8-11.8 5.9-12.1-.1-.1-11.2-4.3-11.3-17ZM55.1 18.8c3-3.6 5-8.6 4.4-13.6-4.3.2-9.5 2.9-12.6 6.5-2.8 3.2-5.2 8.3-4.5 13.2 4.7.4 9.6-2.5 12.7-6.1Z"/></svg>`,
  "microsoft.png": `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><path fill="#F25022" d="M9 9h36v36H9z"/><path fill="#7FBA00" d="M51 9h36v36H51z"/><path fill="#00A4EF" d="M9 51h36v36H9z"/><path fill="#FFB900" d="M51 51h36v36H51z"/></svg>`
};

await mkdir(outDir, { recursive: true });

await Promise.all(
  Object.entries(assets).map(([file, svg]) =>
    sharp(Buffer.from(svg)).png().toFile(path.join(outDir, file))
  )
);

await writeFile(
  path.join(outDir, "README.md"),
  "Generated login UI image assets.\n"
);
