import test from "node:test";
import assert from "node:assert/strict";
import { basePlan, validateCareerInput } from "../lib/career/plan";

const raw = {
  concern: "  취업 방향을 모르겠어요.  ",
  birthDate: "1999-05-03",
  targetDate: "2026-12-23",
  role: "  데이터 분석가 ",
  status: " 취업 준비생 ",
};
const today = "2026-09-23";

test("필수 입력을 검사하고 앞뒤 공백을 제거한다", () => {
  const input = validateCareerInput(raw, today);
  assert.equal(input.concern, "취업 방향을 모르겠어요.");
  assert.equal(input.role, "데이터 분석가");
  assert.equal(input.status, "취업 준비생");
  assert.deepEqual(Object.keys(input).sort(), Object.keys(raw).sort());
});

test("비어 있는 고민과 지난 입사 목표일로 계획을 만들지 않는다", () => {
  assert.throws(() => validateCareerInput({ ...raw, concern: " " }, today), /고민/);
  assert.throws(() => validateCareerInput({ ...raw, targetDate: "2026-09-22" }, today), /입사 목표일/);
  assert.throws(() => validateCareerInput({ ...raw, targetDate: today }, today), /입사 목표일/);
  assert.throws(() => validateCareerInput({ ...raw, targetDate: "2026-02-30" }, today), /입사 목표일/);
});

test("입사 목표일까지 이어지는 세 단계 행동 계획을 제공한다", () => {
  const input = validateCareerInput(raw, today);
  const steps = basePlan(input, today);
  assert.equal(steps.length, 3);
  const periods = steps.map((step) => step.period.split(" ~ "));
  assert.equal(periods[0][0], today);
  assert.equal(periods[2][1], input.targetDate);
  assert.equal(periods[0][1], periods[1][0]);
  assert.equal(periods[1][1], periods[2][0]);
  assert.ok(steps.every((step) => step.title && step.actions.length > 0));
  assert.match(steps[0].actions.join(" "), /데이터 분석가/);
});
