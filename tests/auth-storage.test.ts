import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SajuForm from "../app/saju-form";
import { POST } from "../app/api/plan/route";

test("비회원에게도 고민 입력과 해석 요청 화면이 보인다", () => {
  const html = renderToStaticMarkup(createElement(SajuForm, { language: "ko" }));
  assert.match(html, /로그인 없이도 이용할 수 있습니다/);
  for (const field of ["concern", "birthYear", "birthMonth", "birthDay", "targetDate", "role", "status"]) {
    assert.match(html, new RegExp(`name="${field}"`));
  }
  assert.match(html, /나의 커리어 경로 보기/);
});

test("비회원도 인증 토큰 없이 계획 API를 사용할 수 있다", async () => {
  const originalFetch = globalThis.fetch;
  const originalGeminiKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "";
  globalThis.fetch = async () => Response.json({ jobs: [] });
  try {
    const targetDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const response = await POST(new Request("http://localhost/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concern: "취업 방향을 정하고 싶습니다.",
        birthDate: "1999-05-03",
        targetDate,
        role: "데이터 분석가",
        status: "취업 준비 중",
      }),
    }));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.steps.length, 3);
    assert.equal(body.reading, null);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalGeminiKey;
  }
});

test("해석 저장 테이블은 익명 권한을 제거하고 사용자별 읽기·추가만 허용한다", () => {
  const sql = readFileSync(
    new URL("../supabase/migrations/202609230001_create_saju_readings.sql", import.meta.url),
    "utf8",
  );
  assert.match(sql, /alter table public\.saju_readings enable row level security/i);
  assert.match(sql, /revoke all on public\.saju_readings from anon, authenticated/i);
  assert.match(sql, /grant select, insert on public\.saju_readings to authenticated/i);
  assert.match(sql, /for select to authenticated\s+using \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.match(sql, /for insert to authenticated\s+with check \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.doesNotMatch(sql, /\b(?:birth_date|concern|plan|jobs)\b/i);
});
