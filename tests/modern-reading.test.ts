import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { displayReadingText, parseGeneratedGuidance } from "../lib/career/guidance";
import { POST } from "../app/api/plan/route";
import type { PlanStep } from "../lib/career/plan";

const fallback: PlanStep[] = [
  { title: "방향 찾기", period: "첫째 주", actions: ["경험 정리"] },
  { title: "경험 쌓기", period: "둘째 주", actions: ["프로젝트"] },
  { title: "지원하기", period: "셋째 주", actions: ["지원"] },
];

const generated = {
  reading: {
    summary: "甲木의 강점은 꾸준함입니다. Portfolio로 경험을 보여주세요. 시작이 반입니다.",
    strengths: ["기획(企劃) 경험을 정리하세요.", "行動으로 협업 경험을 보여주세요."],
    cautions: ["완벽주의(完璧主義)보다 작은 지원부터 해보세요.", "日程을 정해 실행하세요."],
    reflection: "오늘 첫 지원(志願)을 위해 무엇을 해볼까요?",
  },
  steps: [
    { title: "방향 찾기", actions: ["경험 정리"] },
    { title: "경험 쌓기", actions: ["프로젝트"] },
    { title: "지원하기", actions: ["지원"] },
  ],
};

test("기존 저장 해석의 한자와 괄호 흔적을 표시 전에 정리한다", () => {
  assert.equal(displayReadingText("꾸준함(持續力)을 살리세요."), "꾸준함을 살리세요.");
  assert.equal(displayReadingText("甲木의 힘(實行)을 Portfolio에 담으세요."), "의 힘을 Portfolio에 담으세요.");
  assert.doesNotMatch(displayReadingText("강점(强點) (漢字)"), /\p{Script=Han}|\(\s*\)/u);
});

test("과거 저장 해석의 어려운 사주 용어를 현대적인 커리어 문장으로 정리한다", () => {
  const legacy = [
    "사주에서 을목 일간은 금(관성)을 만나면 협업 역량이 살아납니다. 데이터 분석 프로젝트로 보여 주세요.",
    "을목 일간의 장점은 꾸준함입니다. 채용 지원을 한 번 더 해보세요.",
    "금(관성)을 강화하면 새로운 기회가 찾아옵니다. 포트폴리오를 다듬어 보세요.",
  ];
  for (const item of legacy) {
    const displayed = displayReadingText(item);
    assert.doesNotMatch(displayed, /사주|을목|일간|관성|금\s*\(|\p{Script=Han}|\(\s*\)/u);
    assert.match(displayed, /[가-힣]/);
  }
  assert.match(displayReadingText(legacy[0]), /데이터 분석 프로젝트/);
  assert.match(displayReadingText(legacy[1]), /채용 지원/);
  assert.match(displayReadingText(legacy[2]), /포트폴리오/);
});

test("일반 단어는 보존하면서 단독 기둥 명칭만 현대화한다", () => {
  assert.equal(
    displayReadingText("일정을 정해두고 채용 지원을 준비하세요."),
    "일정을 정해두고 채용 지원을 준비하세요.",
  );
  assert.equal(
    displayReadingText("현재 하고 계신 업무에서 성과를 찾아보세요."),
    "현재 하고 계신 업무에서 성과를 찾아보세요.",
  );
  const legacy = displayReadingText("임인의 강점은 꾸준함입니다. 일정을 정해두고 프로젝트를 완성하세요.");
  assert.doesNotMatch(legacy, /임인/);
  assert.match(legacy, /성장 방향의 강점/);
  assert.match(legacy, /일정을 정해두고 프로젝트를 완성하세요/);
});

test("새로 생성한 해석은 저장에 쓰이는 모든 필드에서 한자를 제거한다", () => {
  const result = parseGeneratedGuidance(JSON.stringify(generated), fallback);
  assert.ok(result);
  for (const value of [
    result.reading.summary,
    ...result.reading.strengths,
    ...result.reading.cautions,
    result.reading.reflection,
  ]) {
    assert.doesNotMatch(value, /\p{Script=Han}|\(\s*\)/u);
  }
  assert.match(result.reading.summary, /Portfolio/);
  assert.match(result.reading.summary, /시작이 반/);
});

test("모집 기회 섹션이 화면 코드에서 제거되고 기본 계획 API가 공고를 조회하지 않는다", async () => {
  const formSource = readFileSync(new URL("../app/saju-form.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(formSource, /LIVE OPPORTUNITIES|지금 확인할 수 있는 모집 기회|Remotive/);

  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = globalThis.fetch;
  let fetchCount = 0;
  process.env.GEMINI_API_KEY = "";
  globalThis.fetch = async () => { fetchCount++; throw new Error("예상하지 못한 외부 조회"); };
  try {
    const targetDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const response = await POST(new Request("http://localhost/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concern: "데이터 분석 직무로 이직하고 싶습니다.",
        birthDate: "1999-05-03",
        targetDate,
        role: "데이터 분석가",
        status: "재직 중 이직 준비",
      }),
    }));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(fetchCount, 0);
    assert.equal(body.steps.length, 3);
    assert.equal("jobs" in body, false);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});

test("AI 생성 지시문은 커리어 잠재력을 요청하고 실제 공고를 만들지 않는다", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = globalThis.fetch;
  let prompt = "";
  process.env.GEMINI_API_KEY = "test-only-key";
  globalThis.fetch = async (_url, init) => {
    const payload = JSON.parse(String(init?.body));
    prompt = payload.contents[0].parts[0].text;
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(generated) }] } }] });
  };
  try {
    const targetDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const response = await POST(new Request("http://localhost/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concern: "취업 준비에 자신감이 필요합니다.",
        birthDate: "1999-05-03",
        targetDate,
        role: "데이터 분석가",
        status: "취업 준비 중",
      }),
    }));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.planSource, "ai");
    assert.match(prompt, /잠재력/);
    assert.match(prompt, /한자.*쓰지 마세요/);
    assert.match(prompt, /실제 공고.*만들지 마세요/);
    assert.doesNotMatch(body.reading.summary, /\p{Script=Han}/u);
    assert.equal("jobs" in body, false);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});
