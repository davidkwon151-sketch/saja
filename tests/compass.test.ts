import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { POST } from "../app/api/plan/route";
import { baseExtras, basePlan, statusKind } from "../lib/career/plan";
import { careerResources } from "../lib/career/resources";
import { DiagnosisCard, InterviewList, ResourceList, RiskList, WeekChecklist, hashResult } from "../app/compass-sections";

const targetDate = new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const input = {
  concern: "마케팅 3년 경력으로 데이터 분석가로 이직하고 싶은데 SQL 경험이 부족해요.",
  birthDate: "1995-03-10",
  targetDate,
  role: "데이터 분석가",
  status: "재직 중 이직 준비",
};

const full = {
  reading: {
    summary: "꾸준히 기록하는 힘이 분석 업무의 기반이 됩니다. 마케팅 성과를 데이터 언어로 바꿔 보세요.",
    strengths: ["캠페인 성과를 숫자로 본 경험", "이해관계자와 소통한 경험"],
    cautions: ["SQL을 실제 데이터로 연습하기", "분석 결과를 한 장으로 정리하기"],
    reflection: "오늘 어떤 데이터를 한 번 열어볼까요?",
  },
  diagnosis: {
    coreIssue: "분석 역량을 증명할 결과물이 아직 없다는 점이 가장 큰 병목입니다.",
    gaps: [
      { skill: "SQL", level: "missing", evidence: "SQLD 취득 또는 쿼리 포트폴리오" },
      { skill: "지표 설계", level: "partial", evidence: "캠페인 KPI 정의 사례" },
      { skill: "커뮤니케이션", level: "have", evidence: "보고서와 발표 경험" },
    ],
  },
  steps: [
    { title: "기초 다지기", actions: ["SQL 기초 강의 수강", "공공데이터로 쿼리 20개 작성"], milestone: "쿼리 20개를 GitHub에 올림" },
    { title: "결과물 만들기", actions: ["마케팅 데이터 분석 프로젝트 1개"], milestone: "분석 리포트 1건 완성" },
    { title: "지원하기", actions: ["맞춤 이력서로 지원", "면접 연습"], milestone: "지원서 10곳 제출" },
  ],
  firstWeek: ["SQL 강의 1강 듣기", "공고 5개 저장하기", "마케팅 성과 3개 적기"],
  resumeLines: ["캠페인 데이터를 분석해 전환율을 [N]% 개선"],
  interview: [{ question: "왜 데이터 분석가인가요?", tip: "마케팅 성과 분석 경험과 연결하세요." }],
  risks: [{ risk: "업무와 병행이 어렵습니다.", response: "주 2회 고정 시간을 정하세요. 자세한 내용은 https://bad.example.com 참고" }],
  resources: [
    { id: "dataq", reason: "SQLD로 SQL 역량을 증명" },
    { id: "fake-site", reason: "없는 사이트" },
    { id: "kaggle", reason: "http://phishing.test 에서 가입" },
  ],
};

type Call = { url: string; body: { contents: Array<{ parts: Array<{ text: string }> }>; generationConfig: Record<string, unknown> } };

async function withGemini(responder: (call: Call, index: number) => Response | Promise<Response>, body: Record<string, unknown> = input) {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = globalThis.fetch;
  const calls: Call[] = [];
  process.env.GEMINI_API_KEY = "test-only-key";
  globalThis.fetch = async (url, init) => {
    const call = { url: String(url), body: JSON.parse(String(init?.body)) };
    calls.push(call);
    return responder(call, calls.length - 1);
  };
  try {
    const response = await POST(new Request("http://localhost/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }));
    return { status: response.status, body: await response.json(), calls };
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
}

const gemini = (value: unknown) => Response.json({ candidates: [{ content: { parts: [{ text: typeof value === "string" ? value : JSON.stringify(value) }] } }] });
const catalogUrls = new Set(careerResources.map((item) => item.url));

test("전체 응답: 진단·완료 기준·이번 주 할 일·이력서·면접·리스크·리소스를 AI 결과로 반환한다", async () => {
  const { status, body, calls } = await withGemini(() => gemini(full));
  assert.equal(status, 200);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].body.generationConfig.responseSchema, "구조화 출력 스키마를 보낸다");
  assert.equal(body.planSource, "ai");
  assert.equal(body.diagnosis.gaps.length, 3);
  assert.equal(body.steps[0].milestone, "쿼리 20개를 GitHub에 올림");
  assert.deepEqual(body.firstWeek, full.firstWeek);
  assert.deepEqual(body.resumeLines, full.resumeLines);
  assert.deepEqual(body.basicSections, []);
  // 기간은 서버가 정한다
  assert.deepEqual(body.steps.map((step: { period: string }) => step.period), basePlan(input).map((step) => step.period));
  const prompt = calls[0].body.contents[0].parts[0].text;
  assert.match(prompt, /잠재력/);
  assert.match(prompt, /한자.*쓰지 마세요/);
  assert.match(prompt, /실제 공고.*만들지 마세요/);
  assert.match(prompt, /비밀 유지/);
  assert.match(prompt, /\[N\]/);
  assert.match(prompt, /dataq/);
});

test("AI 출력의 URL과 목록에 없는 리소스 id는 쓰지 않는다", async () => {
  const { body } = await withGemini(() => gemini(full));
  assert.doesNotMatch(JSON.stringify(body.risks), /https?:|example\.com/);
  const ids = body.resources.map((item: { id: string }) => item.id);
  assert.ok(ids.includes("dataq"));
  assert.ok(!ids.includes("fake-site"));
  const dataq = body.resources.find((item: { id: string }) => item.id === "dataq");
  assert.equal(dataq.reason, "SQLD로 SQL 역량을 증명");
  assert.equal(dataq.source, "ai");
  const kaggle = body.resources.find((item: { id: string }) => item.id === "kaggle");
  assert.ok(kaggle);
  assert.doesNotMatch(kaggle.reason, /phishing|http/);
  for (const item of body.resources) assert.ok(catalogUrls.has(item.url), item.url);
  assert.ok(body.resources.length >= 4 && body.resources.length <= 8);
  assert.equal(body.searchLinks.length, 3);
  assert.match(body.searchLinks[0].url, /^https:\/\/www\.saramin\.co\.kr\/zf_user\/search\?searchword=%EB%8D%B0/);
});

test("선택 항목이 잘못돼도 필수 해석·계획이 맞으면 AI 결과로 보고 빠진 부분만 기본 제안으로 채운다", async () => {
  const partial = {
    reading: full.reading,
    steps: full.steps.map(({ title, actions }) => ({ title, actions })),
    diagnosis: { coreIssue: 42, gaps: "없음" },
    firstWeek: [1, 2],
    interview: [{ question: "질문만 있음" }],
    resources: "dataq",
  };
  const { body } = await withGemini(() => gemini(partial));
  assert.equal(body.planSource, "ai");
  assert.equal(body.diagnosis, null);
  assert.deepEqual(body.resumeLines, []);
  assert.deepEqual(body.basicSections.sort(), ["firstWeek", "interview", "risks"]);
  assert.deepEqual(body.firstWeek, baseExtras(input).firstWeek);
  assert.ok(body.resources.length >= 4);
  assert.ok(body.resources.every((item: { source: string }) => item.source === "match"));
});

test("스키마 요청이 거부되면 스키마 없이 한 번 다시 요청한다", async () => {
  const { body, calls } = await withGemini((call) =>
    call.body.generationConfig.responseSchema
      ? Response.json({ error: { message: "Invalid schema" } }, { status: 400 })
      : gemini(full));
  assert.equal(calls.length, 2);
  assert.ok(calls[0].body.generationConfig.responseSchema);
  assert.equal(calls[1].body.generationConfig.responseSchema, undefined);
  assert.equal(calls[1].body.generationConfig.responseMimeType, "application/json");
  assert.equal(body.planSource, "ai");
});

test("형식이 깨진 응답은 한 번 재시도한 뒤 기본 계획으로 표시하고 AI 결과로 꾸미지 않는다", async () => {
  const { status, body, calls } = await withGemini(() => gemini("{\"reading\": 깨짐"));
  assert.equal(status, 200);
  assert.equal(calls.length, 2);
  assert.equal(body.planSource, "basic");
  assert.equal(body.reading, null);
  assert.equal(body.diagnosis, null);
  assert.deepEqual(body.resumeLines, []);
  assert.deepEqual(body.steps, basePlan(input));
  assert.deepEqual(body.basicSections.sort(), ["firstWeek", "interview", "risks"]);
  assert.ok(body.resources.length >= 4);
});

test("일시적인 서버 오류는 짧게 한 번만 다시 시도하고, 계속 실패하면 기본 계획으로 표시한다", async () => {
  const { body, calls } = await withGemini(() => new Response("oops", { status: 503 }));
  assert.equal(calls.length, 2);
  assert.ok(calls[1].body.generationConfig.responseSchema, "일시 오류에서는 스키마를 버리지 않는다");
  assert.equal(body.planSource, "basic");
});

test("사용량 한도(429) 뒤 재시도가 성공하면 AI 결과를 쓴다", async () => {
  let count = 0;
  const { body, calls } = await withGemini(() =>
    count++ === 0
      ? Response.json({ error: { details: [{ retryDelay: "1s" }] } }, { status: 429 })
      : gemini(full));
  assert.equal(calls.length, 2);
  assert.equal(body.planSource, "ai");
});

test("한도 초과 대기 시간이 길면 기다리지 않고 기본 계획으로 표시한다", async () => {
  const started = Date.now();
  const { body, calls } = await withGemini(() =>
    Response.json({ error: { details: [{ retryDelay: "40s" }] } }, { status: 429 }));
  assert.equal(calls.length, 1);
  assert.equal(body.planSource, "basic");
  assert.ok(Date.now() - started < 5000);
});

test("최근 명언 id 목록이 이상해도 요청은 정상 처리된다", async () => {
  for (const recentQuoteIds of [["q-1", "q-2"], "문자열", Array(31).fill("x"), [1, 2], ["x".repeat(200)]]) {
    const { status, body } = await withGemini(() => gemini(full), { ...input, recentQuoteIds });
    assert.equal(status, 200);
    assert.ok(body.quote?.text);
  }
});

test("최근에 본 명언 id를 보내면 서버가 명언 선택에서 제외한다", async () => {
  const first = await withGemini(() => new Response("down", { status: 503 }), { ...input, recentQuoteIds: [] });
  const seen = [first.body.quote.id, first.body.motivation.id].filter(Boolean);
  assert.ok(seen.length === 2, "명언과 격언에 id가 있어야 합니다");
  const second = await withGemini(() => new Response("down", { status: 503 }), { ...input, recentQuoteIds: seen });
  assert.ok(!seen.includes(second.body.quote.id));
  assert.ok(!seen.includes(second.body.motivation.id));
});

test("상태별 기본 계획과 리스크·면접 질문이 달라진다", () => {
  assert.equal(statusKind("재취업 준비 중"), "returning");
  assert.equal(statusKind("재직 중 이직 준비"), "employed");
  assert.equal(statusKind("취업 준비 중"), "preparing");
  assert.equal(statusKind("Employed"), "employed");
  const base = { ...input };
  const employed = baseExtras({ ...base, status: "재직 중 이직 준비" });
  const returning = baseExtras({ ...base, status: "재취업 준비 중" });
  const preparing = baseExtras({ ...base, status: "취업 준비 중" });
  assert.match(JSON.stringify(employed.risks), /퇴사|비밀|회사/);
  assert.match(JSON.stringify(returning.risks), /공백/);
  assert.match(JSON.stringify(preparing.risks), /경험/);
  for (const extras of [employed, returning, preparing]) {
    assert.ok(extras.firstWeek.length >= 3 && extras.firstWeek.length <= 5);
    assert.ok(extras.interview.length >= 2);
  }
  assert.match(basePlan({ ...base, status: "재취업 준비 중" })[0].actions.join(" "), /공백/);
  assert.ok(basePlan(base).every((step) => step.milestone));
  const english = baseExtras({ ...base, role: "Data analyst", status: "Employed" }, "en");
  assert.doesNotMatch(JSON.stringify(english), /[가-힣]/);
});

test("결과 섹션을 렌더링하고 외부 링크는 새 탭·noopener로 연다", () => {
  const html = renderToStaticMarkup(createElement(ResourceList, {
    resources: [
      { id: "dataq", name: "데이터자격검정", url: "https://www.dataq.or.kr/", category: "certificate", reason: "SQLD 준비", source: "ai" },
      { id: "saramin", name: "사람인", url: "https://www.saramin.co.kr/", category: "jobs", reason: "공고 검색", source: "match" },
      { id: "bad", name: "나쁜 링크", url: "javascript:alert(1)", category: "jobs", reason: "x", source: "match" },
    ],
    searchLinks: [{ id: "search-saramin", site: "사람인", url: "https://www.saramin.co.kr/zf_user/search?searchword=x" }],
    language: "ko",
  }));
  assert.match(html, /target="_blank"/);
  assert.equal((html.match(/rel="noopener noreferrer"/g) || []).length, 3);
  assert.doesNotMatch(html, /javascript:/);
  assert.ok(html.indexOf("채용 찾기") < html.indexOf("자격·어학"));
  assert.match(html, /AI 추천/);

  const diagnosis = renderToStaticMarkup(createElement(DiagnosisCard, { diagnosis: { coreIssue: "증거 부족", gaps: [{ skill: "SQL", level: "missing", evidence: "SQLD" }, { skill: "소통", level: "have", evidence: "발표" }] }, language: "ko" }));
  assert.match(diagnosis, /gap-missing/);
  assert.match(diagnosis, /부족/);
  assert.match(diagnosis, /보유/);

  const week = renderToStaticMarkup(createElement(WeekChecklist, { tasks: ["공고 5개 저장"], storageKey: hashResult(["a"]), basic: true, language: "en" }));
  assert.match(week, /type="checkbox"/);
  assert.match(week, /Basic suggestion/);
  assert.equal(hashResult(["a"]), hashResult(["a"]));
  assert.notEqual(hashResult(["a"]), hashResult(["b"]));

  const interview = renderToStaticMarkup(createElement(InterviewList, { items: [{ question: "Q", tip: "T" }], basic: false, language: "ko" }));
  assert.doesNotMatch(interview, /기본 제안/);
  const risks = renderToStaticMarkup(createElement(RiskList, { items: [{ risk: "R", response: "S" }], basic: true, language: "ko" }));
  assert.match(risks, /기본 제안/);
});

test("결과 화면 순서: 진단은 계획 앞, 실행 섹션은 계획 뒤, 미래 장면은 마지막", () => {
  const source = readFileSync(new URL("../app/saju-form.tsx", import.meta.url), "utf8");
  assert.match(source, /import "\.\/compass\.css"/);
  assert.doesNotMatch(source, /LIVE OPPORTUNITIES|지금 확인할 수 있는 모집 기회|Remotive/);
  const interpretation = source.indexOf('className="interpretation-card"');
  const diagnosis = source.indexOf("<DiagnosisCard");
  const plan = source.indexOf('className="plan-list"');
  const week = source.indexOf("<WeekChecklist");
  const resources = source.indexOf("<ResourceList");
  const insights = source.indexOf("<QuokkaInsights");
  const ending = source.lastIndexOf("<FutureEnding");
  assert.ok(interpretation < diagnosis && diagnosis < plan && plan < week && week < resources && resources < insights && insights < ending);
  assert.match(source, /recentQuoteIds: readRecentQuoteIds\(\)/);
  assert.match(source, /rememberQuoteIds\(/);
  const css = readFileSync(new URL("../app/compass.css", import.meta.url), "utf8");
  assert.match(css, /min-height: 44px/);
});
