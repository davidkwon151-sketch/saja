import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SajuForm from "../app/saju-form";
import { todayInKorea } from "../lib/career/plan";

for (const language of ["ko", "en"] as const) {
  test(`${language} 날짜 입력은 연·월·일과 세 가지 빠른 목표일을 제공한다`, () => {
    const html = renderToStaticMarkup(createElement(SajuForm, { language }));
    assert.match(html, /<fieldset class="birth-date-field">/);
    const birthYear = html.match(/<input[^>]*name="birthYear"[^>]*>/)?.[0];
    assert.ok(birthYear);
    assert.match(birthYear, /type="number"/);
    assert.match(birthYear, /min="1900"/);
    assert.match(html, /name="birthMonth"/);
    assert.match(html, /name="birthDay"/);
    assert.match(html, /<option value="02">2<\/option>/);
    assert.match(html, /<option value="31">31<\/option>/);
    assert.equal((html.match(/class="target-preset"/g) ?? []).length, 3);
    assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, 3);
    assert.match(html, /type="button" class="target-preset"/);
    const targetDate = html.match(/<input[^>]*name="targetDate"[^>]*>/)?.[0];
    assert.ok(targetDate);
    assert.match(targetDate, /type="date"/);
    assert.doesNotMatch(html, /name="birthTime"|name="time"/);
  });
}

test("입사 목표일은 한국 날짜 기준 내일부터 선택할 수 있다", () => {
  const today = todayInKorea();
  const tomorrow = new Date(Date.parse(`${today}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
  const html = renderToStaticMarkup(createElement(SajuForm, { language: "ko" }));
  const targetDate = html.match(/<input[^>]*name="targetDate"[^>]*>/)?.[0];
  assert.ok(targetDate);
  assert.match(targetDate, new RegExp(`min="${tomorrow}"`));
});
