import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  careerResources,
  jobSearchLinks,
  rankResources,
  roleTracks,
  selectResources,
} from "../lib/career/resources";

const categories = new Set(["jobs", "learning", "certificate", "contest", "portfolio", "network", "support", "research"]);

test("리소스 목록은 30~45개의 고유한 https 링크와 한·영 설명을 가진다", () => {
  assert.ok(careerResources.length >= 30 && careerResources.length <= 45, `개수: ${careerResources.length}`);
  assert.equal(new Set(careerResources.map((item) => item.id)).size, careerResources.length);
  for (const item of careerResources) {
    assert.equal(new URL(item.url).protocol, "https:", item.id);
    assert.ok(categories.has(item.category), item.id);
    assert.ok(item.desc.ko && /[가-힣]/.test(item.desc.ko), item.id);
    assert.ok(item.desc.en && !/[가-힣]/.test(item.desc.en), item.id);
  }
  for (const category of categories)
    assert.ok(careerResources.some((item) => item.category === category), `${category} 분류가 비어 있음`);
});

test("모든 리소스 URL은 검증 기록에 남아 있다", () => {
  const log = readFileSync(new URL("../exports/resource-verification-2026-09-25.txt", import.meta.url), "utf8");
  for (const item of careerResources) assert.ok(log.includes(item.url), `검증 기록 없음: ${item.url}`);
});

test("직무 문장에서 직무군을 찾는다", () => {
  assert.deepEqual(roleTracks("데이터 분석가"), ["data"]);
  assert.ok(roleTracks("백엔드 개발자").includes("dev"));
  assert.ok(roleTracks("해외영업").includes("global"));
  assert.ok(roleTracks("해외영업").includes("sales"));
  assert.ok(roleTracks("UX 디자이너").includes("design"));
  assert.ok(roleTracks("공기업 행정직").includes("public"));
  assert.deepEqual(roleTracks("Email marketer"), ["marketing"]);
});

test("직무·상태·고민에 맞는 리소스를 4~8개, 분류 순서대로 고른다", () => {
  const data = selectResources({ role: "데이터 분석가", status: "취업 준비 중", concern: "SQL 자격증과 포트폴리오가 부족해요", language: "ko" });
  assert.ok(data.length >= 4 && data.length <= 8);
  const ids = data.map((item) => item.id);
  assert.ok(ids.includes("dataq"), ids.join(","));
  assert.ok(data.some((item) => item.category === "jobs"));
  const order = ["jobs", "support", "learning", "certificate", "contest", "portfolio", "network", "research"];
  const positions = data.map((item) => order.indexOf(item.category));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  for (const item of data) assert.ok(item.reason.length > 0);

  const returning = selectResources({ role: "사무 행정", status: "재취업 준비 중", concern: "육아로 5년 경력 단절이 있어요", language: "ko" });
  assert.ok(returning.some((item) => item.id === "saeil"), returning.map((item) => item.id).join(","));

  const employed = rankResources({ role: "해외영업", status: "재직 중 이직 준비", concern: "외국계로 옮기고 싶어요", language: "ko" }).slice(0, 8).map((item) => item.id);
  assert.ok(employed.includes("peoplenjob") || employed.includes("linkedin-jobs"), employed.join(","));

  const design = selectResources({ role: "UX 디자이너", status: "취업 준비 중", concern: "포트폴리오", language: "en" });
  assert.ok(!design.some((item) => item.id === "dataq"));
  assert.ok(design.every((item) => !/[가-힣]/.test(item.reason)));
});

test("AI가 고른 id는 목록에 있을 때만 쓰고 이유를 붙이며 URL은 항상 목록에서 온다", () => {
  const picked = selectResources(
    { role: "데이터 분석가", status: "취업 준비 중", concern: "경험 부족", language: "ko" },
    [{ id: "kaggle", reason: "공개 데이터로 분석 결과물 만들기" }, { id: "not-real", reason: "x" }, { id: "youthcenter" }],
  );
  const kaggle = picked.find((item) => item.id === "kaggle");
  assert.ok(kaggle);
  assert.equal(kaggle.source, "ai");
  assert.equal(kaggle.reason, "공개 데이터로 분석 결과물 만들기");
  assert.equal(kaggle.url, "https://www.kaggle.com/");
  assert.ok(!picked.some((item) => item.id === "not-real"));
  const youth = picked.find((item) => item.id === "youthcenter");
  assert.ok(youth && youth.reason.length > 0);
  const catalogUrls = new Set(careerResources.map((item) => item.url));
  for (const item of picked) assert.ok(catalogUrls.has(item.url));
});

test("희망 직무로 채용 사이트 검색 링크를 만든다", () => {
  const ko = jobSearchLinks("데이터 분석가", "ko");
  assert.equal(ko.length, 3);
  assert.equal(ko[0].url, "https://www.saramin.co.kr/zf_user/search?searchword=%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B6%84%EC%84%9D%EA%B0%80");
  assert.ok(ko.some((link) => link.url.startsWith("https://www.jobkorea.co.kr/Search/?stext=")));
  assert.ok(ko.some((link) => link.url.startsWith("https://www.wanted.co.kr/search?query=")));
  const en = jobSearchLinks("Data Analyst & BI", "en");
  assert.ok(en.some((link) => link.url === "https://www.linkedin.com/jobs/search/?keywords=Data%20Analyst%20%26%20BI&location=South%20Korea"));
  assert.deepEqual(jobSearchLinks("   ", "ko"), []);
  for (const link of [...ko, ...en]) assert.equal(new URL(link.url).protocol, "https:");
});
