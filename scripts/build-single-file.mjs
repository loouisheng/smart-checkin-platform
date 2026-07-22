/**
 * Folds the Vite build into one portable HTML file.
 *
 * The demo copy has to run straight from a USB stick or an email attachment, so every
 * script and stylesheet is inlined and the page keeps working from file://.
 *
 * Usage: npm run build:single
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const output = process.argv[2] ? resolve(root, process.argv[2]) : join(root, "deliverables", "smart-checkin-demo.html");

if (!existsSync(join(dist, "index.html"))) {
  console.error("dist/index.html is missing — run `npm run build` first.");
  process.exit(1);
}

// A closing tag inside inlined JS or CSS would end the surrounding element early.
const guard = (code) => code.replaceAll("</script", "<\\/script").replaceAll("</style", "<\\/style");
const read = (asset) => readFileSync(join(dist, asset.replace(/^\.?\//, "")), "utf8");

let html = readFileSync(join(dist, "index.html"), "utf8");
const inlined = { scripts: 0, styles: 0 };

html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (match, src) => {
  if (/^https?:/.test(src)) return match;
  inlined.scripts += 1;
  const type = /type="module"/.test(match) ? ' type="module"' : "";
  return `<script${type}>\n${guard(read(src))}\n</script>`;
});

html = html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g, (match, href) => {
  if (/^https?:/.test(href)) return match;
  inlined.styles += 1;
  return `<style>\n${guard(read(href))}\n</style>`;
});

const leftover = html.match(/(?:src|href)="\.?\/?assets\/[^"]+"/g);
if (leftover) {
  console.error(`Some assets are still referenced externally: ${leftover.join(", ")}`);
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, html, "utf8");
console.log(`Single-file demo written to ${output.replace(root + "\\", "").replace(`${root}/`, "")}`);
console.log(`  inlined ${inlined.scripts} script(s), ${inlined.styles} stylesheet(s) · ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
