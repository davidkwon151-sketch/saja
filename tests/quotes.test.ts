import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  QUOTE_POOL,
  QUOTE_TAGS,
  analyzeQuoteContext,
  buildConnection,
  selectCareerMotivation,
  selectCareerQuote,
  type QuoteInput,
} from "../lib/career/quotes";
import { RECENT_QUOTES_KEY, readRecentQuoteIds, rememberQuoteIds } from "../lib/career/recent-quotes";

const HANGUL = /[가-힣]/;
const HAN = /\p{Script=Han}/u;

function base(overrides: Partial<QuoteInput> = {}): QuoteInput {
  return { age: 29, concern: "", role: "데이터 분석가", status: "취업 준비 중", language: "ko", ...overrides };
}

function seq(...values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

test("검증된 풀은 명언 40개·격언 30개 이상이고 id와 문장이 겹치지 않는다", () => {
  const quotes = QUOTE_POOL.filter((item) => item.kind === "quote");
  const proverbs = QUOTE_POOL.filter((item) => item.kind === "proverb");
  assert.ok(quotes.length >= 40, `quotes: ${quotes.length}`);
  assert.ok(proverbs.length >= 30, `proverbs: ${proverbs.length}`);
  assert.equal(new Set(QUOTE_POOL.map((item) => item.id)).size, QUOTE_POOL.length, "id 중복");
  assert.equal(new Set(QUOTE_POOL.map((item) => item.text.toLowerCase())).size, QUOTE_POOL.length, "문장 중복");
  // 격언은 여러 문화권에서 온다.
  const origins = new Set(proverbs.map((item) => item.attribution.split(" ")[0]));
  assert.ok(origins.size >= 12, `proverb origins: ${[...origins].join(", ")}`);
  // 명언은 특정 인물에 몰리지 않는다.
  const people = new Map<string, number>();
  for (const item of quotes) {
    const who = item.attribution.split(" · ")[0];
    people.set(who, (people.get(who) ?? 0) + 1);
  }
  assert.ok(people.size >= 35, `people: ${people.size}`);
  assert.ok(Math.max(...people.values()) <= 4);
});

test("모든 항목은 https 출처·출처 표기·한국어 번역·태그를 갖고, 원문에는 한글·한자가 없다", () => {
  for (const item of QUOTE_POOL) {
    assert.match(item.sourceUrl, /^https:\/\//, item.id);
    assert.ok(item.attribution.trim().length > 0, item.id);
    assert.match(item.translation.ko, HANGUL, item.id);
    assert.doesNotMatch(item.text, HANGUL, item.id);
    assert.doesNotMatch(item.text, HAN, item.id);
    assert.ok(item.text.split(/\s+/).length <= 40, `${item.id} 은 짧은 발췌여야 한다`);
    assert.ok(item.tags.length > 0, item.id);
    for (const tag of item.tags) assert.ok(QUOTE_TAGS.includes(tag), `${item.id}: ${tag}`);
  }
  // 모든 태그에 명언과 격언이 최소 3개씩 있어야 고민별로 고를 수 있다.
  for (const tag of QUOTE_TAGS) {
    for (const kind of ["quote", "proverb"] as const) {
      const count = QUOTE_POOL.filter((item) => item.kind === kind && item.tags.includes(tag)).length;
      assert.ok(count >= 3, `${kind}/${tag}: ${count}`);
    }
  }
});

test("풀의 모든 항목이 검증 로그에서 PASS로 기록되어 있다", () => {
  const log = readFileSync(new URL("../exports/quote-verification-2026-09-25.txt", import.meta.url), "utf8");
  const passed = new Set(log.split(/\r?\n/).filter((line) => line.startsWith("PASS ")).map((line) => line.split(/\s+/)[2]));
  for (const item of QUOTE_POOL) assert.ok(passed.has(item.id), `${item.id} 가 검증 로그에 없다`);
});

test("고민 분석은 한국어·영어 키워드와 상태를 여러 태그 가중치로 바꾼다", () => {
  const ko = analyzeQuoteContext(base({ concern: "서류에서 계속 탈락하고 혼자 준비해서 불안합니다" }));
  assert.ok(ko.setback > 0 && ko.together > 0 && ko.courage > 0);
  const en = analyzeQuoteContext(base({ concern: "I keep getting rejected and I feel burned out", status: "Employed", language: "en" }));
  assert.ok(en.setback >= 4 && en.balance >= 4);
  const returning = analyzeQuoteContext(base({ concern: "", status: "재취업 준비 중" }));
  assert.ok(returning.gap > returning.change);
  const working = analyzeQuoteContext(base({ concern: "", status: "재직 중 이직 준비" }));
  assert.ok(working.balance > 0 && working.change > 0);
  const seeking = analyzeQuoteContext(base({ concern: "", status: "취업 준비 중" }));
  assert.ok(seeking.start > seeking.gap);
});

test("서로 다른 고민은 서로 다른 명언·격언과 연결 문장을 받는다", () => {
  const concerns = [
    "계속 불합격합니다",
    "혼자 준비하니 외롭고 힘듭니다",
    "2년 공백기가 있어서 자신감이 없어요",
    "회사 다니면서 병행하니 번아웃이 왔어요",
    "무엇을 해야 할지 방향이 막막합니다",
    "포트폴리오와 실력이 부족합니다",
  ];
  const results = concerns.map((concern) => {
    const input = base({ concern, random: () => 0 });
    return { quote: selectCareerMotivation(input), proverb: selectCareerQuote(input) };
  });
  assert.equal(new Set(results.map((r) => r.quote.id)).size, concerns.length);
  assert.equal(new Set(results.map((r) => r.proverb.id)).size, concerns.length);
  assert.equal(new Set(results.map((r) => r.proverb.connection)).size, concerns.length);
  for (const { quote, proverb } of results) {
    assert.notEqual(quote.id, proverb.id);
    assert.notEqual(quote.text, proverb.text);
    assert.match(proverb.connection ?? "", /데이터 분석가/);
  }
  // 고민에 맞는 주제의 문장이 선택된다.
  const byId = new Map(QUOTE_POOL.map((item) => [item.id, item]));
  assert.ok(byId.get(results[0].proverb.id)!.tags.includes("setback"));
  assert.ok(byId.get(results[1].proverb.id)!.tags.includes("together"));
  assert.ok(byId.get(results[3].proverb.id)!.tags.includes("balance"));
});

test("같은 고민이라도 무작위 값에 따라 여러 문장이 나오고, 주입한 random이면 결과가 재현된다", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 10; i += 1) seen.add(selectCareerQuote(base({ concern: "계속 불합격합니다", random: () => i / 10 })).id);
  assert.ok(seen.size >= 4, `variety: ${seen.size}`);
  const a = selectCareerQuote(base({ concern: "이직 방향이 막막합니다", random: seq(0.42, 0.7) }));
  const b = selectCareerQuote(base({ concern: "이직 방향이 막막합니다", random: seq(0.42, 0.7) }));
  assert.deepEqual(a, b);
  const m1 = selectCareerMotivation(base({ concern: "이직 방향이 막막합니다", random: () => 0.33 }));
  const m2 = selectCareerMotivation(base({ concern: "이직 방향이 막막합니다", random: () => 0.33 }));
  assert.deepEqual(m1, m2);
});

test("최근 본 id는 제외하고, 전부 제외되면 전체에서 다시 고른다", () => {
  const input = base({ concern: "계속 불합격합니다", random: () => 0 });
  const first = selectCareerQuote(input);
  const second = selectCareerQuote({ ...input, exclude: [first.id] });
  assert.notEqual(second.id, first.id);
  const firstQuote = selectCareerMotivation(input);
  assert.notEqual(selectCareerMotivation({ ...input, exclude: [firstQuote.id] }).id, firstQuote.id);

  const allProverbs = QUOTE_POOL.filter((item) => item.kind === "proverb").map((item) => item.id);
  const fallback = selectCareerQuote({ ...input, exclude: allProverbs });
  assert.ok(fallback.id && fallback.text && fallback.connection);

  // 여러 번 이어서 보면 20개 이내에서 같은 격언이 반복되지 않는다.
  const recent: string[] = [];
  for (let i = 0; i < 15; i += 1) {
    const next = selectCareerQuote({ ...input, random: () => (i * 0.37) % 1, exclude: recent });
    assert.ok(!recent.includes(next.id), `repeat at ${i}: ${next.id}`);
    recent.push(next.id);
  }
});

test("한국어 화면은 번역을 주고, 영어 화면 결과에는 한글이 전혀 없다", () => {
  const ko = selectCareerQuote(base({ concern: "이직이 두렵습니다", random: () => 0.5 }));
  assert.ok(ko.translation && HANGUL.test(ko.translation));
  const concerns = ["I keep getting rejected", "I feel lost about my direction", "Returning after a career break", "Burned out while working", "", "I have no network"];
  for (const concern of concerns) {
    for (const r of [0, 0.3, 0.6, 0.99]) {
      const input: QuoteInput = { age: 35, concern, role: "Data analyst", status: "Employed", language: "en", random: () => r };
      for (const result of [selectCareerQuote(input), selectCareerMotivation(input)]) {
        assert.equal(result.translation, undefined);
        assert.doesNotMatch(JSON.stringify(result), HANGUL);
      }
      assert.match(selectCareerQuote(input).connection ?? "", /Data analyst/);
    }
  }
});

test("연결 문장은 태그마다 여러 형태가 있고 직무를 넣어 구체적 행동으로 바꾼다", () => {
  for (const tag of QUOTE_TAGS) {
    const ko = new Set([0, 0.4, 0.9].map((r) => buildConnection(tag, "UX 디자이너", "ko", () => r)));
    const en = new Set([0, 0.4, 0.9].map((r) => buildConnection(tag, "UX designer", "en", () => r)));
    assert.ok(ko.size >= 3 && en.size >= 3, tag);
    for (const line of ko) assert.match(line, /UX 디자이너/);
    for (const line of en) {
      assert.match(line, /UX designer/);
      assert.doesNotMatch(line, HANGUL);
    }
  }
  assert.match(buildConnection("start", "", "ko", () => 0), /희망 직무/);
  assert.match(buildConnection("start", "  ", "en", () => 0), /your target role/);
});

test("최근 문장 기록은 localStorage가 없거나 깨져도 안전하고 최근 20개만 유지한다", () => {
  const holder = globalThis as { localStorage?: unknown };
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const store = new Map<string, string>();
  try {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: undefined });
    assert.deepEqual(readRecentQuoteIds(), []);
    rememberQuoteIds(["a"]);

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => void store.set(key, value) },
    });
    store.set(RECENT_QUOTES_KEY, "{not json");
    assert.deepEqual(readRecentQuoteIds(), []);
    store.delete(RECENT_QUOTES_KEY);
    for (let i = 0; i < 25; i += 1) rememberQuoteIds([`q-${i}`, `p-${i}`]);
    const ids = readRecentQuoteIds();
    assert.equal(ids.length, 20);
    assert.deepEqual(ids.slice(-2), ["q-24", "p-24"]);
    rememberQuoteIds(["q-24"]);
    assert.equal(readRecentQuoteIds().at(-1), "q-24");
    assert.equal(readRecentQuoteIds().filter((id) => id === "q-24").length, 1);

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } },
    });
    assert.deepEqual(readRecentQuoteIds(), []);
    assert.doesNotThrow(() => rememberQuoteIds(["x"]));
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete holder.localStorage;
  }
});
