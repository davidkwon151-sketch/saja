import test from "node:test";
import assert from "node:assert/strict";
import { parseGeneratedGuidance } from "../lib/career/guidance";
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
  assert.equal(parseGeneratedGuidance(JSON.stringify({ ...response, reading: { ...response.reading, cautions: ["하나"] } }), fallback), null);
  assert.equal(parseGeneratedGuidance(JSON.stringify({ ...response, steps: response.steps.slice(0, 2) }), fallback), null);
});

test("과도하게 긴 내용과 빈 행동을 거부한다", () => {
  assert.equal(parseGeneratedGuidance(JSON.stringify({ ...response, reading: { ...response.reading, summary: "가".repeat(351) } }), fallback), null);
  assert.equal(parseGeneratedGuidance(JSON.stringify({ ...response, steps: [{ ...response.steps[0], actions: [" "] }, ...response.steps.slice(1)] }), fallback), null);
});
