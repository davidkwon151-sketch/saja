import type { PlanStep } from "./plan";

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
    .replace(/임인(?=의|은|는|이|가|을|를|\s|[.,!?])/gu, "성장 방향")
    .replace(/[갑을병정무기경신임계][목화토금수]/gu, "기본 성향")
    .replace(/사주/gu, "생년월일 기반 경향")
    .replace(/일간|오행|관성/gu, "특성")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.;!?，。])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const clean = displayReadingText(value);
  return clean && clean.length <= max ? clean : null;
}

function twoTexts(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const items = value.map((item) => text(item, 160));
  return items.every((item) => item !== null) ? (items as string[]) : null;
}

export function parseGeneratedGuidance(
  raw: string,
  fallback: PlanStep[],
): GeneratedGuidance | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || !isRecord(parsed.reading) || !Array.isArray(parsed.steps))
    return null;

  const summary = text(parsed.reading.summary, 350);
  const strengths = twoTexts(parsed.reading.strengths);
  const cautions = twoTexts(parsed.reading.cautions);
  const reflection = text(parsed.reading.reflection, 180);
  if (!summary || !strengths || !cautions || !reflection || parsed.steps.length !== 3)
    return null;

  const steps: PlanStep[] = [];
  for (const [index, item] of parsed.steps.entries()) {
    if (!isRecord(item) || !Array.isArray(item.actions) || item.actions.length < 1 || item.actions.length > 3)
      return null;
    const title = text(item.title, 80);
    const actions = item.actions.map((action) => text(action, 220));
    if (!title || actions.some((action) => action === null)) return null;
    steps.push({ title, period: fallback[index].period, actions: actions as string[] });
  }
  return { reading: { summary, strengths, cautions, reflection }, steps };
}
