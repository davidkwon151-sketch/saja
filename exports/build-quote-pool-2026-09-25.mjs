// Regenerates the QUOTE_POOL block in lib/career/quotes.ts from verified candidates only.
// Usage: node exports/build-quote-pool-2026-09-25.mjs exports/quote-candidates-2026-09-25.json exports/quote-verification-2026-09-25.txt
import { readFileSync, writeFileSync } from "node:fs";

const [, , candidatesPath, logPath] = process.argv;
const candidates = JSON.parse(readFileSync(candidatesPath, "utf8"));
const passed = new Set(
  readFileSync(logPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.startsWith("PASS "))
    .map((line) => line.split(/\s+/)[2]),
);
const verified = candidates.filter((c) => passed.has(c.id));
const esc = (s) => JSON.stringify(s);
const lines = verified.map(
  (c) =>
    `  { id: ${esc(c.id)}, kind: ${esc(c.kind)}, text: ${esc(c.text)}, translation: { ko: ${esc(c.ko)} }, attribution: ${esc(c.attribution)}, sourceUrl: ${esc(c.sourceUrl)}, tags: [${c.tags.map(esc).join(", ")}] },`,
);
const target = "lib/career/quotes.ts";
const source = readFileSync(target, "utf8");
const start = source.indexOf("// <pool>");
const end = source.indexOf("// </pool>");
if (start < 0 || end < 0) throw new Error("pool markers not found");
const next = `${source.slice(0, start)}// <pool>\n${lines.join("\n")}\n  ${source.slice(end)}`;
writeFileSync(target, next, "utf8");
console.log(`wrote ${verified.length} items (${verified.filter((c) => c.kind === "quote").length} quotes, ${verified.filter((c) => c.kind === "proverb").length} proverbs)`);
