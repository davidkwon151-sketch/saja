import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ageAt, nearbyAges } from "../lib/career/closing";
import { selectCareerQuote } from "../lib/career/quotes";
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

test("20대와 40대 모두 이미지 위 네 나이가 본인 나이 ±7 안에 있다", () => {
  for (const age of [22, 29, 40, 47]) {
    const ages = nearbyAges(age);
    assert.equal(ages.length, 4);
    assert.ok(ages.every((peerAge) => Math.abs(peerAge - age) <= 7));
    assert.deepEqual([...ages].sort((a, b) => a - b), ages);
  }
});

test("격언은 고민과 언어에 따라 달라지고 알려진 속담은 출처가 있다", () => {
  const setback = selectCareerQuote({ age: 26, concern: "계속 불합격합니다", role: "분석가", status: "취업 준비 중", language: "ko" });
  const teamwork = selectCareerQuote({ age: 26, concern: "혼자 준비하니 힘듭니다", role: "분석가", status: "취업 준비 중", language: "ko" });
  const english = selectCareerQuote({ age: 43, concern: "Career transition", role: "Analyst", status: "Employed", language: "en" });
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

test("미래 장면에 정확한 격언 제목과 나이 네 개가 함께 표시된다", () => {
  const html = renderToStaticMarkup(createElement(FutureEnding, {
    age: 34,
    nearbyAges: [27, 32, 36, 41],
    quote: {
      text: "Well begun is half done.",
      connection: "데이터 분석가를 향해 오늘 작은 프로젝트를 시작해 보세요.",
      attribution: "English proverb",
      sourceUrl: "https://example.org/source",
    },
    language: "ko",
  }));
  assert.match(html, /내 고민과 연결한 격언/);
  assert.match(html, /Well begun is half done/);
  assert.match(html, /데이터 분석가를 향해 오늘 작은 프로젝트를 시작해 보세요/);
  assert.match(html, /class="future-connection"/);
  for (const age of [27, 32, 36, 41]) assert.match(html, new RegExp(`${age}세`));
  for (const label of ["새로운 출발", "나의 강점 발견", "한 걸음 전진", "다음 도전"])
    assert.doesNotMatch(html, new RegExp(label));
  assert.match(html, /href="https:\/\/example.org\/source"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("미래 장면은 결과의 마지막에 놓이며 결과가 없으면 나타나지 않는다", () => {
  const source = readFileSync(new URL("../app/saju-form.tsx", import.meta.url), "utf8");
  const endingPosition = source.lastIndexOf("<FutureEnding");
  assert.ok(endingPosition > 0, "결과에 미래 장면이 연결되어야 합니다");
  assert.ok(endingPosition > source.indexOf('className="saved-section"'));
  assert.ok(endingPosition > source.indexOf('className="plan-list"'));
  assert.match(source.slice(endingPosition - 120, endingPosition + 160), /result/);
});

test("AI를 사용할 수 없어도 나이·고민별 격언과 3단계 계획을 반환한다", async () => {
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
    assert.deepEqual(body.nearbyAges, nearbyAges(body.age));
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

test("영어 선택 시 API가 영어 기본 계획과 격언을 반환한다", async () => {
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
    assert.match(body.quote.connection, /Data analyst/);
    assert.doesNotMatch(body.quote.text, /[가-힣\p{Script=Han}]/u);
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});
