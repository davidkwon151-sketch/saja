import type { Interview, PlanStep, Risk } from "./plan";

export type SajuReading = {
  summary: string;
  strengths: string[];
  cautions: string[];
  reflection: string;
};

export type GeneratedGuidance = { reading: SajuReading; steps: PlanStep[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function displayReadingText(value: string): string {
  return value
    .replace(/\([^()]*\p{Script=Han}[^()]*\)/gu, "")
    .replace(/\p{Script=Han}/gu, "")
    .replace(/(?:강한|약한|많은|부족한)\s*[목화토금수]\([^)]*\)\s*기운/gu, "뚜렷한 업무 성향")
    .replace(/[목화토금수]\([^)]*\)/gu, "업무 성향")
    .replace(/[갑을병정무기경신임계][목화토금수]\s*일간/gu, "기본 성향")
    .replace(/[갑을병정무기경신임계][자축인묘진사오미신유술해]\s*(?:년주|월주|일주)/gu, "성장 방향")
    .replace(/(?<![가-힣])임인(?=의|은|는|이|가|을|를|\s|[.,!?]|$)/gu, "성장 방향")
    // 병목·임금·기금처럼 일반 단어를 바꾸지 않도록 실제 천간·오행 조합이 단어로 쓰인 경우만 바꾼다.
    .replace(/(?<![가-힣])(?:갑목|을목|병화|정화|무토|기토|경금|신금|임수|계수)(?=[의은는이가을를와과도]|\s|[.,!?]|$)/gu, "기본 성향")
    .replace(/사주/gu, "생년월일 기반 경향")
    // "3일간", "일간지", "관성적" 같은 일반 표현은 그대로 둔다.
    .replace(/(?<![\d가-힣])(?:일간|오행|관성)(?=[의은는이가을를와과도에]|\s|[.,!?)]|$)/gu, "특성")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.;!?，。])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** 모델이 만든 링크는 사용하지 않는다. 링크는 서버의 검증된 목록에서만 나온다. */
const urlPatterns = [
  /(?:https?:\/\/|www\.)[^\s)\]]+/gi,
  /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|kr|dev|ai)\b(?:\/[^\s)\]]*)?/g,
];

export function containsUrl(value: string): boolean {
  return urlPatterns.some((pattern) => new RegExp(pattern.source, pattern.flags.replace("g", "")).test(value));
}

function stripUrls(value: string): string {
  return urlPatterns.reduce((current, pattern) => current.replace(pattern, ""), value);
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const clean = displayReadingText(stripUrls(value).replace(/\(\s*\)/g, ""));
  return clean && clean.length <= max ? clean : null;
}

/** 올바른 항목만 남기고 최대 개수까지 자른다. 최소 개수보다 적으면 null. */
function list<T>(value: unknown, read: (item: unknown) => T | null, min: number, max: number): T[] | null {
  if (!Array.isArray(value)) return null;
  const items: T[] = [];
  for (const item of value) {
    const parsed = read(item);
    if (parsed !== null) items.push(parsed);
    if (items.length >= max) break;
  }
  return items.length >= min ? items : null;
}

export type GapLevel = "have" | "partial" | "missing";
export type SkillGap = { skill: string; level: GapLevel; evidence: string };
export type Diagnosis = { coreIssue: string; gaps: SkillGap[] };
export type { Interview, Risk };
export type ResourcePick = { id: string; reason?: string };

export type GuidanceExtras = {
  diagnosis?: Diagnosis;
  firstWeek?: string[];
  resumeLines?: string[];
  interview?: Interview[];
  risks?: Risk[];
  resources?: ResourcePick[];
};

export type FullGuidance = GeneratedGuidance & GuidanceExtras;

const levelAliases: Record<string, GapLevel> = {
  have: "have", has: "have", strong: "have", "보유": "have", "있음": "have",
  partial: "partial", some: "partial", "부분": "partial", "일부": "partial",
  missing: "missing", none: "missing", gap: "missing", "부족": "missing", "없음": "missing",
};

function readGap(item: unknown): SkillGap | null {
  if (!isRecord(item)) return null;
  const skill = text(item.skill, 60);
  const level = typeof item.level === "string" ? levelAliases[item.level.trim().toLowerCase()] : undefined;
  const evidence = text(item.evidence, 220);
  return skill && level && evidence ? { skill, level, evidence } : null;
}

function readDiagnosis(value: unknown): Diagnosis | undefined {
  if (!isRecord(value)) return undefined;
  const coreIssue = text(value.coreIssue, 240);
  const gaps = list(value.gaps, readGap, 1, 4) || [];
  if (!coreIssue && gaps.length === 0) return undefined;
  if (!coreIssue) return undefined;
  return { coreIssue, gaps };
}

function readPair<K extends string, V extends string>(keyA: K, maxA: number, keyB: V, maxB: number) {
  return (item: unknown) => {
    if (!isRecord(item)) return null;
    const a = text(item[keyA], maxA);
    const b = text(item[keyB], maxB);
    return a && b ? ({ [keyA]: a, [keyB]: b } as Record<K | V, string>) : null;
  };
}

function readResourcePicks(value: unknown, knownIds: ReadonlySet<string>): ResourcePick[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const picks: ResourcePick[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    const id = typeof item === "string" ? item.trim() : isRecord(item) && typeof item.id === "string" ? item.id.trim() : "";
    if (!knownIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    const rawReason = isRecord(item) && typeof item.reason === "string" ? item.reason : "";
    // 이유에 링크가 들어 있으면 이유 전체를 버리고 카탈로그 설명을 쓴다.
    const reason = rawReason && !containsUrl(rawReason) ? text(rawReason, 160) : null;
    picks.push(reason ? { id, reason } : { id });
    if (picks.length >= 5) break;
  }
  return picks.length ? picks : undefined;
}

/**
 * Gemini 응답을 검사한다. 필수: reading(요약·강점 1~3·조언 1~3·질문)과 3단계 계획.
 * 선택 항목은 각각 따로 검사해 잘못된 부분만 버린다.
 */
export function parseGeneratedGuidance(
  raw: string,
  fallback: PlanStep[],
  knownResourceIds: ReadonlySet<string> = new Set(),
): FullGuidance | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    return null;
  }
  if (!isRecord(parsed) || !isRecord(parsed.reading) || !Array.isArray(parsed.steps))
    return null;

  const summary = text(parsed.reading.summary, 600);
  const strengths = list(parsed.reading.strengths, (item) => text(item, 260), 1, 3);
  const cautions = list(parsed.reading.cautions, (item) => text(item, 260), 1, 3);
  const reflection = text(parsed.reading.reflection, 260);
  if (!summary || !strengths || !cautions || !reflection || parsed.steps.length < 3)
    return null;

  const steps: PlanStep[] = [];
  for (const [index, item] of parsed.steps.slice(0, 3).entries()) {
    if (!isRecord(item)) return null;
    const title = text(item.title, 100);
    const actions = list(item.actions, (action) => text(action, 300), 1, 3);
    if (!title || !actions) return null;
    const milestone = text(item.milestone, 220);
    steps.push({
      title,
      period: fallback[index].period,
      actions,
      ...(milestone ? { milestone } : {}),
    });
  }

  const result: FullGuidance = { reading: { summary, strengths, cautions, reflection }, steps };
  const diagnosis = readDiagnosis(parsed.diagnosis);
  if (diagnosis) result.diagnosis = diagnosis;
  const firstWeek = list(parsed.firstWeek, (item) => text(item, 180), 2, 5);
  if (firstWeek) result.firstWeek = firstWeek;
  const resumeLines = list(parsed.resumeLines, (item) => text(item, 240), 1, 3);
  if (resumeLines) result.resumeLines = resumeLines;
  const interview = list(parsed.interview, readPair("question", 180, "tip", 240), 1, 3);
  if (interview) result.interview = interview;
  const risks = list(parsed.risks, readPair("risk", 180, "response", 300), 1, 2);
  if (risks) result.risks = risks;
  const resources = readResourcePicks(parsed.resources ?? parsed.resourceIds, knownResourceIds);
  if (resources) result.resources = resources;
  return result;
}
