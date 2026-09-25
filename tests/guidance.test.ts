import test from "node:test";
import assert from "node:assert/strict";
import { displayReadingText, parseGeneratedGuidance } from "../lib/career/guidance";
import type { PlanStep } from "../lib/career/plan";

const fallback: PlanStep[] = [
  { title: "1단계", period: "첫째 기간", actions: ["기본 행동"] },
  { title: "2단계", period: "둘째 기간", actions: ["기본 행동"] },
  { title: "3단계", period: "셋째 기간", actions: ["기본 행동"] },
];

const response = {
  reading: {
    summary: "  직무 경험을 돌아보세요.  ",
    strengths: ["꾸준함", "관찰력"],
    cautions: ["서두르지 않기", "경험 확인하기"],
    reflection: "어떤 경험을 더 쌓고 싶나요?",
  },
  steps: [
    { title: "  방향 정하기  ", period: "AI가 정한 날짜", actions: ["공고 살펴보기"] },
    { title: "경험 쌓기", actions: ["프로젝트 만들기"] },
    { title: "지원하기", actions: ["서류 제출하기"] },
  ],
};

test("정상 응답을 읽고 기준 계획의 날짜를 유지한다", () => {
  const result = parseGeneratedGuidance(JSON.stringify(response), fallback);
  assert.ok(result);
  assert.equal(result.reading.summary, "직무 경험을 돌아보세요.");
  assert.deepEqual(result.reading.strengths, ["꾸준함", "관찰력"]);
  assert.equal(result.steps[0].title, "방향 정하기");
  assert.deepEqual(result.steps.map((step) => step.period), fallback.map((step) => step.period));
});

test("깨진 JSON과 해석 또는 계획이 빠진 응답을 거부한다", () => {
  assert.equal(parseGeneratedGuidance("{", fallback), null);
  assert.equal(parseGeneratedGuidance(JSON.stringify({ steps: response.steps }), fallback), null);
  assert.equal(parseGeneratedGuidance(JSON.stringify({ ...response, reading: { ...response.reading, cautions: [] } }), fallback), null);
  assert.equal(parseGeneratedGuidance(JSON.stringify({ ...response, steps: response.steps.slice(0, 2) }), fallback), null);
});

test("과도하게 긴 요약과 빈 행동만 있는 단계를 거부한다", () => {
  assert.equal(parseGeneratedGuidance(JSON.stringify({ ...response, reading: { ...response.reading, summary: "가".repeat(601) } }), fallback), null);
  assert.equal(parseGeneratedGuidance(JSON.stringify({ ...response, steps: [{ ...response.steps[0], actions: [" "] }, ...response.steps.slice(1)] }), fallback), null);
});

test("항목 수가 조금 달라도 전체를 버리지 않고 최대 개수까지 자른다", () => {
  const result = parseGeneratedGuidance(JSON.stringify({
    ...response,
    reading: { ...response.reading, strengths: ["하나", "둘", "셋", "넷"], cautions: ["하나만"] },
    steps: [
      { title: "1", actions: ["a", "b", "c", "d"] },
      { title: "2", actions: ["a", "가".repeat(400)] },
      { title: "3", actions: ["a"] },
      { title: "4", actions: ["a"] },
    ],
  }), fallback);
  assert.ok(result);
  assert.equal(result.reading.strengths.length, 3);
  assert.deepEqual(result.reading.cautions, ["하나만"]);
  assert.equal(result.steps.length, 3);
  assert.equal(result.steps[0].actions.length, 3);
  assert.deepEqual(result.steps[1].actions, ["a"]);
});

test("선택 항목은 잘못된 부분만 버리고 필수 해석과 계획은 유지한다", () => {
  const known = new Set(["saramin", "dataq"]);
  const result = parseGeneratedGuidance(JSON.stringify({
    ...response,
    steps: response.steps.map((step, index) => ({ ...step, milestone: index === 0 ? "공고 5개 요약 완료" : 3 })),
    diagnosis: { coreIssue: "실무 증거가 부족합니다.", gaps: [{ skill: "SQL", level: "부족", evidence: "SQLD 취득" }, { skill: "x", level: "unknown", evidence: "y" }] },
    firstWeek: "매일 공부",
    resumeLines: ["고객 문의 [N]건을 분류해 처리 시간을 [N]% 줄임"],
    interview: [{ question: "왜 이 직무인가요?" }],
    risks: [{ risk: "경험 부족", response: "https://evil.example.com 참고" }],
    resources: [{ id: "dataq", reason: "SQLD 준비" }, { id: "made-up", reason: "x" }, { id: "saramin", reason: "https://www.saramin.co.kr 에서 검색" }, "dataq"],
  }), fallback, known);
  assert.ok(result);
  assert.equal(result.steps[0].milestone, "공고 5개 요약 완료");
  assert.equal(result.steps[1].milestone, undefined);
  assert.deepEqual(result.diagnosis?.gaps, [{ skill: "SQL", level: "missing", evidence: "SQLD 취득" }]);
  assert.equal(result.firstWeek, undefined);
  assert.equal(result.interview, undefined);
  assert.deepEqual(result.resumeLines, ["고객 문의 [N]건을 분류해 처리 시간을 [N]% 줄임"]);
  // 링크는 지우고 남은 문장만 쓴다
  assert.equal(result.risks?.[0].response, "참고");
  // 목록에 없는 id는 버리고, 이유에 링크가 있으면 이유만 버린다
  assert.deepEqual(result.resources, [{ id: "dataq", reason: "SQLD 준비" }, { id: "saramin" }]);
});

test("명리 용어 정리 규칙이 병목·임금·7일간 같은 일반 커리어 단어를 바꾸지 않는다", () => {
  for (const sentence of [
    "가장 큰 병목은 결과물이 없다는 점입니다.",
    "희망 임금과 기금 지원 조건을 확인하세요.",
    "7일간 매일 1시간씩 SQL을 연습하세요.",
    "관성적으로 지원하지 말고 책임인 업무를 정리하세요.",
    "일간지 경제면에서 산업 흐름을 읽어 보세요.",
  ]) assert.equal(displayReadingText(sentence), sentence);
  assert.equal(displayReadingText("을목의 장점은 꾸준함입니다."), "기본 성향의 장점은 꾸준함입니다.");
  assert.equal(displayReadingText("오행을 참고하세요."), "특성을 참고하세요.");
});

test("코드 블록으로 감싼 JSON도 읽는다", () => {
  const result = parseGeneratedGuidance("```json\n" + JSON.stringify(response) + "\n```", fallback);
  assert.ok(result);
});
