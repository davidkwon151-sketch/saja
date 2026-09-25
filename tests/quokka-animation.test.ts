import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import QuokkaGuide from "../app/quokka-guide";
import { messages } from "../app/i18n";

const source = readFileSync(new URL("../app/quokka-guide.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("기본 쿼카에는 대기 문구와 키보드로 누를 수 있는 이름 있는 버튼이 있다", () => {
  for (const language of ["ko", "en"] as const) {
    const html = renderToStaticMarkup(createElement(QuokkaGuide, { language }));
    assert.match(html, /<button\b[^>]*type="button"[^>]*aria-label="[^"]+"/);
    assert.match(html, /role="status" aria-live="polite"/);
    assert.ok(html.includes(messages[language].quokkaWaiting));
    assert.ok(html.includes(messages[language].quokkaGreet));
    assert.doesNotMatch(html, /is-happy|is-visible/);
  }
  assert.match(css, /button:focus-visible/);
});

test("기본·웃는 쿼카 이미지가 모두 연결되고 실제 파일로 존재한다", () => {
  const html = renderToStaticMarkup(createElement(QuokkaGuide, { language: "ko" }));
  for (const name of ["quokka-original-v02.png", "quokka-laugh-v02.png"]) {
    assert.ok(html.includes(`src="/${name}"`));
    assert.ok(statSync(new URL(`../public/${name}`, import.meta.url)).size > 0);
  }
  assert.match(css, /\.quokka-character\.is-happy \.quokka-original\s*\{\s*opacity:\s*0/);
  assert.match(css, /\.quokka-character\.is-happy \.quokka-laugh\s*\{\s*opacity:\s*1/);
});

test("마우스·펜 호버와 버튼 클릭이 웃음 상태를 만들고 1.8초 뒤 돌아간다", () => {
  assert.match(source, /const happy = hovered \|\| greeted/);
  assert.match(source, /event\.pointerType === "mouse" \|\| event\.pointerType === "pen"/);
  assert.match(source, /onPointerLeave=\{\(\) => setHovered\(false\)\}/);
  assert.match(source, /onClick=\{greet\}/);
  assert.match(source, /setGreeted\(true\)/);
  assert.match(source, /setTimeout\(\(\) => setGreeted\(false\), 1800\)/);
  assert.match(source, /clearTimeout\(resetTimer\.current\)/);
  assert.match(css, /@keyframes quokka-float/);
  assert.match(css, /@keyframes quokka-wiggle/);
  assert.match(css, /@keyframes quokka-burst/);
});

test("두 언어에 대기·웃음·말풍선 문구가 있고 첫 화면에서 선택 언어가 전달된다", () => {
  for (const language of ["ko", "en"] as const) {
    const copy = messages[language];
    for (const key of ["quokkaGreet", "quokkaWaiting", "quokkaHappy", "quokkaBubble"] as const)
      assert.ok(copy[key].length > 0);
  }
  assert.notEqual(messages.ko.quokkaHappy, messages.en.quokkaHappy);
  assert.match(page, /<QuokkaGuide language=\{language\}/);
  assert.match(page, /<SajuForm language=\{language\}/);
});

test("움직임 줄이기와 작은 화면 배치를 CSS에서 지원한다", () => {
  assert.match(source, /window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.quokka-character, \.quokka-character\.is-happy, \.quokka-particle\s*\{\s*animation: none !important/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /\.quokka-scene\s*\{\s*width: min\(100%, (?:2[4-9]\d|3[0-7]\d)px\)/);
});
