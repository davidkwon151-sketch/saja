// Quote/proverb source verification script (not shipped with the app).
// Usage: node exports/verify-quotes-2026-09-25.mjs <candidates.json> [log.txt]
// Fetches every sourceUrl, splits the HTML into <h2> sections, normalizes text,
// and checks that each candidate text appears in an acceptable section.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";

const [, , candidatesPath, logPath] = process.argv;
if (!candidatesPath) {
  console.error("usage: node verify-quotes-2026-09-25.mjs <candidates.json> [log.txt]");
  process.exit(2);
}
const candidates = JSON.parse(readFileSync(candidatesPath, "utf8"));
const cacheDir = join(tmpdir(), "career-quote-verify-cache");
mkdirSync(cacheDir, { recursive: true });

// Required: Disputed, Misattributed, Quotes about…, About…, See also.
// Stricter additions: Attributed / Unsourced (no primary source on Wikiquote).
const REJECT_SECTION = /^(disputed|misattributed|quotes? about|about |see also|external links|sayings about|attributed|unsourced)/i;

function decodeEntities(s) {
  return s
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<sup[\s\S]*?<\/sup>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

export function normalize(s) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’‚‛′]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/[‐-―−]/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPage(url) {
  const file = join(cacheDir, createHash("sha1").update(url).digest("hex") + ".html");
  if (existsSync(file)) return readFileSync(file, "utf8");
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) career-compass-quote-verifier/1.0",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  writeFileSync(file, html);
  return html;
}

// Keep only the article body (MediaWiki parser output) and drop image captions,
// so a navigation TOC or a caption never counts as the place a quote was found.
function articleBody(rawHtml) {
  // Parsoid pages embed raw wikitext (including "== Misattributed ==" blocks) inside
  // data-mw attributes; drop every attribute value except class/id before anything else.
  const html = rawHtml.replace(/<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g, (_, tag, attrs, slash) => {
    const kept = [...attrs.matchAll(/\s(class|id)\s*=\s*("[^"]*"|'[^']*')/g)].map((m) => ` ${m[1]}=${m[2].replace(/^'|'$/g, '"')}`).join("");
    return `<${tag}${kept}${slash}>`;
  });
  const start = html.search(/<div[^>]*class="[^"]*mw-parser-output[^"]*"/i);
  let body = start >= 0 ? html.slice(start) : html;
  const end = body.search(/<div[^>]*class="printfooter"|<div[^>]*id="catlinks"/i);
  if (end > 0) body = body.slice(0, end);
  return body
    .replace(/<figcaption[\s\S]*?<\/figcaption>/gi, " ")
    .replace(/<div[^>]*class="[^"]*thumbcaption[^"]*"[\s\S]*?<\/div>/gi, " ")
    .replace(/<div[^>]*class="[^"]*(?:toc|navbox)[^"]*"[\s\S]*?<\/div>/gi, " ");
}

// Split by <h2>, and inside each h2 also by <h3>/<h4>, so a "Misattributed"
// sub-heading nested under "Quotes" is still detected.
export function sections(html) {
  const out = [];
  let h2 = "(lead)";
  let sub = "";
  const tokens = articleBody(html).split(/(<h[234][\s>][\s\S]*?<\/h[234]>)/i);
  for (const token of tokens) {
    const heading = token.match(/^<h([234])[\s>]/i);
    if (heading) {
      const title = stripTags(token).replace(/\[edit\]/gi, "").replace(/\s+/g, " ").trim();
      if (heading[1] === "2") { h2 = title; sub = ""; } else sub = title;
      continue;
    }
    out.push({ title: sub ? `${h2} > ${sub}` : h2, h2, sub, text: normalize(stripTags(token)), items: listItems(token) });
  }
  return out;
}

function listItems(html) {
  return [...html.matchAll(/<(li|dd|p)[\s>][\s\S]*?<\/\1>/gi)].map((m) => stripTags(m[0]).replace(/\s+/g, " ").trim()).filter((t) => t.length > 8);
}

function suggestions(secs, target) {
  const words = new Set(normalize(target).split(" "));
  const scored = [];
  for (const sec of secs) {
    for (const item of sec.items) {
      if (item.length > 700) continue;
      const tokens = new Set(normalize(item).split(" "));
      const hit = [...words].filter((t) => tokens.has(t)).length;
      const score = hit / Math.max(words.size, 1);
      if (score >= 0.6) scored.push({ score, section: sec.title, item: item.slice(0, 260) });
    }
  }
  return scored.sort((a, b) => b.score - a.score || a.item.length - b.item.length).slice(0, 3);
}

const lines = [];
const log = (s = "") => { lines.push(s); console.log(s); };
log(`Career Compass quote verification — ${new Date().toISOString()}`);
log(`Input: ${candidatesPath}`);
log(`Rule: first normalized match must be in an <h2> (and <h3>/<h4>) section not titled Disputed / Misattributed / Quotes about… / About… / See also / Attributed / Unsourced.`);
log("");

let pass = 0;
const rejected = [];
for (const c of candidates) {
  const target = normalize(c.text);
  let status;
  let detail = "";
  try {
    if (c.manualReject) throw Object.assign(new Error(c.manualReject), { manual: true });
    const secs = sections(await fetchPage(c.sourceUrl));
    const first = secs.find((s) => s.text.includes(target));
    if (!first) {
      status = "REJECT";
      detail = "not found on source page";
      const sug = suggestions(secs, c.text);
      for (const s of sug) detail += `\n      ~ [${s.section}] (${Math.round(s.score * 100)}%) ${s.item}`;
    } else if (REJECT_SECTION.test(first.h2) || REJECT_SECTION.test(first.sub)) {
      status = "REJECT";
      detail = `first match is in section "${first.title}"`;
    } else {
      status = "PASS";
      detail = `section "${first.title}"`;
    }
  } catch (error) {
    status = "REJECT";
    detail = error.manual ? `manual review: ${error.message}` : `fetch failed: ${error.message}`;
  }
  if (status === "PASS") pass += 1;
  else rejected.push(c.id);
  log(`${status.padEnd(6)} ${c.kind.padEnd(7)} ${c.id} — "${c.text}" (${c.attribution})`);
  log(`       ${c.sourceUrl}`);
  log(`       ${detail}`);
}
const quotesPass = candidates.filter((c) => c.kind === "quote" && !rejected.includes(c.id)).length;
const provPass = candidates.filter((c) => c.kind === "proverb" && !rejected.includes(c.id)).length;
log("");
log(`SUMMARY: ${pass}/${candidates.length} verified (quotes ${quotesPass}, proverbs ${provPass}); rejected ${rejected.length}: ${rejected.join(", ")}`);
if (logPath) writeFileSync(logPath, lines.join("\n") + "\n", "utf8");
