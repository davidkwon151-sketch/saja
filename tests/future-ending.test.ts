import "./support/ignore-css";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ageAt } from "../lib/career/closing";
import { QUOTE_POOL, selectCareerMotivation, selectCareerQuote } from "../lib/career/quotes";
import FutureEnding from "../app/future-ending";
import { POST } from "../app/api/plan/route";

const futureInput = {
  concern: "이직 방향이 막막합니다.",
  birthDate: "1992-10-04",
  targetDate: "2027-12-31",
  role: "데이터 분석가",
  status: "재직 중 이직 준비",
};

test("한국 날짜 기준 생일 전후의 만 나이를 정확히 구한다", () => {
  assert.equal(ageAt("1992-10-04", "2026-10-03"), 33);
  assert.equal(ageAt("1992-10-04", "2026-10-04"), 34);
  assert.equal(ageAt("1980-01-01", "2026-09-23"), 46);
});

test("격언은 고민과 언어에 따라 달라지고 알려진 속담은 출처가 있다", () => {
  const setback = selectCareerQuote({ age: 26, concern: "계속 불합격합니다", role: "분석가", status: "취업 준비 중", language: "ko", random: () => 0 });
  const teamwork = selectCareerQuote({ age: 26, concern: "혼자 준비하니 힘듭니다", role: "분석가", status: "취업 준비 중", language: "ko", random: () => 0 });
  const english = selectCareerQuote({ age: 43, concern: "Career transition", role: "Analyst", status: "Employed", language: "en", random: () => 0 });
  assert.notEqual(setback.text, teamwork.text);
  assert.notEqual(setback.connection, teamwork.connection);
  assert.match(setback.connection || "", /분석가/);
  assert.match(teamwork.connection || "", /분석가/);
  assert.match(setback.text, /[A-Za-z]/);
  assert.doesNotMatch(setback.text, /[가-힣\p{Script=Han}]/u);
  assert.match(english.text, /[A-Za-z]/);
  assert.doesNotMatch(english.text, /[가-힣\p{Script=Han}]/u);
  assert.match(english.connection || "", /Analyst/);
  assert.doesNotMatch(english.connection || "", /[가-힣\p{Script=Han}]/u);
  for (const quote of [setback, teamwork, english]) {
    assert.ok(quote.text.length > 0);
    assert.doesNotMatch(quote.text, /\p{Script=Han}/u);
    if (quote.attribution) {
      assert.ok(quote.sourceUrl);
      assert.match(quote.sourceUrl!, /^https:\/\//);
    }
  }
});

test("취업 고민별 명언과 격언은 서로 다르고 여러 검증 가능한 출처를 가진다", () => {
  const concerns = ["계속 불합격합니다", "혼자 준비하니 힘듭니다", "포트폴리오가 부족합니다", "이직을 고민합니다", "첫 취업을 준비합니다"];
  const results = concerns.map((concern) => {
    const input = { age: 26, concern, role: "분석가", status: "취업 준비 중", language: "ko" as const, random: () => 0 };
    return { motivation: selectCareerMotivation(input), proverb: selectCareerQuote(input) };
  });
  assert.ok(new Set(results.map(({ motivation }) => motivation.text)).size >= 3);
  assert.ok(new Set(results.map(({ proverb }) => proverb.text)).size >= 3);
  for (const { motivation, proverb } of results) {
    assert.notEqual(motivation.text, proverb.text);
    for (const saying of [motivation, proverb]) {
      assert.ok(saying.text.length > 0);
      assert.ok(saying.attribution);
      assert.ok(saying.sourceUrl);
      assert.match(saying.sourceUrl!, /^https:\/\//);
      assert.ok(saying.translation, "한국어 화면에는 번역이 함께 온다");
    }
  }
  const sourceHosts = new Set(QUOTE_POOL.map((item) => new URL(item.sourceUrl).hostname));
  assert.ok(sourceHosts.size >= 3, "명언과 격언 풀은 세 곳 이상의 서로 다른 사이트를 사용해야 합니다");
});

test("마지막 이미지에 정확한 메시지와 명언·격언을 표시하고 네 나이표는 표시하지 않는다", () => {
  const html = renderToStaticMarkup(createElement(FutureEnding, {
    quote: {
      text: "Well begun is half done.",
      connection: "데이터 분석가를 향해 오늘 작은 프로젝트를 시작해 보세요.",
      attribution: "English proverb",
      sourceUrl: "https://example.org/proverb",
    },
    motivation: {
      text: "Stay hungry. Stay foolish.",
      attribution: "Steve Jobs",
      sourceUrl: "https://example.org/quote",
    },
    language: "ko",
  }));
  assert.match(html, /내일의 나는 오늘의 내가 만듭니다/);
  assert.match(html, /내 고민과 연결한 명언/);
  assert.match(html, /내 고민과 연결한 격언/);
  assert.match(html, /Stay hungry\. Stay foolish\./);
  assert.match(html, /Well begun is half done/);
  assert.match(html, /데이터 분석가를 향해 오늘 작은 프로젝트를 시작해 보세요/);
  assert.match(html, /class="future-connection"/);
  assert.doesNotMatch(html, /future-ages|future-age|\d+세|\d+ years old/);
  for (const label of ["새로운 출발", "나의 강점 발견", "한 걸음 전진", "다음 도전"])
    assert.doesNotMatch(html, new RegExp(label));
  assert.match(html, /href="https:\/\/example.org\/proverb"/);
  assert.match(html, /href="https:\/\/example.org\/quote"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("영문 화면은 영문 메시지와 명언·격언 레이블을 표시한다", () => {
  const html = renderToStaticMarkup(createElement(FutureEnding, {
    quote: { text: "Practice makes perfect.", attribution: "English proverb", sourceUrl: "https://example.org/proverb" },
    motivation: { text: "Well done is better than well said.", attribution: "Benjamin Franklin", sourceUrl: "https://example.org/quote" },
    language: "en",
  }));
  assert.match(html, /I create tomorrow through what I do today/);
  assert.match(html, /A QUOTE FOR YOUR NEXT STEP/);
  assert.match(html, /A PROVERB FOR YOUR CONCERN/);
  assert.doesNotMatch(html, /[가-힣\p{Script=Han}]/u);
  assert.doesNotMatch(html, /future-ages|future-age/);
});

test("한국어 화면은 영어 원문 아래 번역을 보여 주고, 영어 화면은 번역을 숨긴다", () => {
  const props = {
    quote: {
      id: "jp-seven-eight",
      text: "Fall down seven times, get up eight.",
      translation: "일곱 번 넘어져도 여덟 번 일어난다.",
      connection: "지난 데이터 분석가 지원에서 배운 점 한 가지를 적어 보세요.",
      attribution: "Japanese proverb",
      sourceUrl: "https://en.wikiquote.org/wiki/Japanese_proverbs",
    },
    motivation: {
      id: "laozi-journey",
      text: "A journey of a thousand li starts with a single step.",
      translation: "천 리 길도 한 걸음에서 시작된다.",
      attribution: "Laozi · Tao Te Ching",
      sourceUrl: "https://en.wikiquote.org/wiki/Laozi",
    },
  };
  const korean = renderToStaticMarkup(createElement(FutureEnding, { ...props, language: "ko" }));
  assert.match(korean, /<blockquote lang="en">Fall down seven times, get up eight\.<\/blockquote><p class="future-translation" lang="ko">일곱 번 넘어져도 여덟 번 일어난다\.<\/p>/);
  assert.match(korean, /천 리 길도 한 걸음에서 시작된다/);
  assert.match(korean, /class="future-connection"/);
  assert.match(korean, /출처/);
  assert.match(korean, /href="https:\/\/en.wikiquote.org\/wiki\/Laozi"/);

  const english = renderToStaticMarkup(createElement(FutureEnding, {
    quote: { ...props.quote, connection: "Write down one lesson from your last Data analyst application." },
    motivation: props.motivation,
    language: "en",
  }));
  assert.doesNotMatch(english, /future-translation/);
  assert.doesNotMatch(english, /[가-힣]/);
  assert.match(english, /TODAY&#x27;S STEP|TODAY'S STEP/);
});

test("미래 장면은 결과의 마지막에 놓이며 결과가 없으면 나타나지 않는다", () => {
  const source = readFileSync(new URL("../app/saju-form.tsx", import.meta.url), "utf8");
  const endingPosition = source.lastIndexOf("<FutureEnding");
  assert.ok(endingPosition > 0, "결과에 미래 장면이 연결되어야 합니다");
  const insightsPosition = source.indexOf("<QuokkaInsights");
  assert.ok(insightsPosition >= 0, "저장된 가능성의 쿼카 화면이 연결되어야 합니다");
  assert.ok(endingPosition > insightsPosition, "미래 장면은 쿼카 인사이트 다음에 표시되어야 합니다");
  assert.ok(endingPosition > source.indexOf('className="plan-list"'));
  assert.match(source.slice(endingPosition - 120, endingPosition + 160), /result/);
});

test("AI를 사용할 수 없어도 고민별 명언·격언과 3단계 계획을 반환한다", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = globalThis.fetch;
  let called = false;
  process.env.GEMINI_API_KEY = "";
  globalThis.fetch = async () => { called = true; throw new Error("외부 호출 없음"); };
  try {
    const response = await POST(new Request("http://localhost/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...futureInput, language: "ko" }),
    }));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(called, false);
    assert.equal(body.planSource, "basic");
    assert.equal(body.steps.length, 3);
    assert.equal(body.age, ageAt(futureInput.birthDate));
    assert.ok(body.motivation?.text);
    assert.ok(body.motivation?.sourceUrl);
    assert.match(body.motivation.sourceUrl, /^https:\/\//);
    assert.ok(body.quote?.text);
    assert.match(body.quote.connection, /데이터 분석가/);
    assert.match(body.quote.text, /[A-Za-z]/);
    assert.doesNotMatch(body.quote.text, /[가-힣]/);
    assert.doesNotMatch(body.quote.text, /\p{Script=Han}/u);
    assert.equal("jobs" in body, false);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});

test("영어 선택 시 API가 영어 기본 계획과 명언·격언을 반환한다", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "";
  try {
    const response = await POST(new Request("http://localhost/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...futureInput, concern: "I want to change careers.", role: "Data analyst", status: "Employed", language: "en" }),
    }));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.steps.length, 3);
    assert.match(body.steps[0].title, /^[A-Za-z]/);
    assert.ok(body.quote?.text);
    assert.ok(body.motivation?.text);
    assert.match(body.motivation.sourceUrl, /^https:\/\//);
    assert.doesNotMatch(body.motivation.text, /[가-힣\p{Script=Han}]/u);
    assert.match(body.quote.connection, /Data analyst/);
    assert.doesNotMatch(body.quote.text, /[가-힣\p{Script=Han}]/u);
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});
