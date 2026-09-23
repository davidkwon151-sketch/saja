import test from "node:test";
import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import QuokkaInsights, { insightNarration, type SavedInsight } from "../app/quokka-insights";

const reading: SavedInsight = {
  id: "insight-one",
  created_at: "2026-09-23T01:00:00Z",
  summary: "Your curiosity opens new opportunities. 🌱",
  strengths: ["You explain complex ideas clearly.", "You turn questions into experiments."],
  cautions: ["Start with one portfolio project.", "Ask a colleague for feedback."],
  reflection: "What will you try this week?",
};

test("음성 원문은 요약·강점·성장 조언·질문을 순서대로 빠짐없이 담는다", () => {
  assert.equal(insightNarration(reading), [reading.summary, ...reading.strengths, ...reading.cautions, reading.reflection].join("\n\n"));
  const legacy = { ...reading, summary: "사주 (甲木) 호기심", strengths: ["木", "  작은 도전  "] };
  const text = insightNarration(legacy);
  assert.doesNotMatch(text, /\p{Script=Han}|사주/u);
  assert.ok(text.includes("작은 도전"));
  assert.doesNotMatch(text, /\n{3,}/);
  assert.equal(legacy.summary, "사주 (甲木) 호기심", "저장된 원문은 변경하지 않는다");
});

test("두 화면 언어에서 듣기·중단과 별도 전체 원문을 제공하고 저장된 글의 언어는 유지한다", () => {
  for (const language of ["ko", "en"] as const) {
    const html = renderToStaticMarkup(createElement(QuokkaInsights, { readings: [reading], language, error: "" }));
    assert.match(html, /<button type="button"/);
    assert.ok(html.includes(language === "ko" ? "처음부터 듣기" : "Listen from the start"));
    assert.ok(html.includes(language === "ko" ? "멈추고 전체 보기" : "Stop &amp; show all"));
    const transcript = html.slice(html.indexOf('<details class="insight-transcript">'));
    assert.ok(transcript.includes(language === "ko" ? "전체 인사이트 읽기" : "Read the complete insight"));
    for (const text of [reading.summary, ...reading.strengths, ...reading.cautions, reading.reflection]) assert.ok(transcript.includes(text));
    assert.match(html, /role="status"/);
    assert.doesNotMatch(html, /class="insight-scene is-speaking"/);
  }
});

test("이력이 여러 개면 이름표가 연결된 선택기에 모두 표시하고 첫 이력을 기본으로 보여준다", () => {
  const second = { ...reading, id: "insight-two", summary: "A different saved possibility." };
  const html = renderToStaticMarkup(createElement(QuokkaInsights, { readings: [reading, second], language: "ko", error: "" }));
  assert.match(html, /<label for="insight-selection">/);
  assert.match(html, /<select id="insight-selection">/);
  assert.match(html, /<option value="insight-one" selected="">/);
  assert.match(html, /<option value="insight-two">/);
  assert.equal((html.match(/class="insight-transcript"/g) ?? []).length, 1);
  assert.ok(html.includes(reading.reflection));
});

test("빈 이력과 조회 실패도 쿼카 안내를 표시하며 읽을 글이 없을 때 재생 버튼을 제공하지 않는다", () => {
  for (const language of ["ko", "en"] as const) {
    const html = renderToStaticMarkup(createElement(QuokkaInsights, { readings: [], language, error: "History unavailable" }));
    assert.match(html, /role="alert">History unavailable/);
    assert.ok(html.includes(language === "ko" ? "가능성이 기다리고 있어요" : "Your next possibility is waiting"));
    assert.doesNotMatch(html, /<button|<select|insight-transcript/);
    assert.match(html, /class="insight-screen-reader"/);
  }
});

test("두 쿼카 표정은 실제 이미지 파일에 연결되고 장식 이미지는 중복 낭독하지 않는다", () => {
  const html = renderToStaticMarkup(createElement(QuokkaInsights, { readings: [reading], language: "ko", error: "" }));
  assert.match(html, /class="insight-character" aria-hidden="true"/);
  for (const name of ["quokka-original-v02.png", "quokka-laugh-v02.png"]) {
    assert.ok(html.includes(`src="/${name}"`));
    assert.ok(statSync(new URL(`../public/${name}`, import.meta.url)).size > 0);
  }
});
