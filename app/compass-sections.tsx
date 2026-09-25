"use client";

import { useEffect, useState } from "react";
import { displayReadingText, type Diagnosis, type GapLevel } from "../lib/career/guidance";
import type { Interview, Risk } from "../lib/career/plan";
import type { ResourceCategory, SearchLink, SelectedResource } from "../lib/career/resources";
import { messages, type Language } from "./i18n";

type Messages = (typeof messages)[Language];

export function hashResult(value: unknown): string {
  const input = JSON.stringify(value);
  let hash = 5381;
  for (let index = 0; index < input.length; index++) hash = ((hash << 5) + hash + input.charCodeAt(index)) | 0;
  return (hash >>> 0).toString(36);
}

function BasicBadge({ t }: { t: Messages }) {
  return <span className="compass-basic" title={t.basicSectionHelp}>{t.basicSection}</span>;
}

const levelLabel = (t: Messages, level: GapLevel) =>
  level === "have" ? t.gapHave : level === "partial" ? t.gapPartial : t.gapMissing;

export function DiagnosisCard({ diagnosis, language }: { diagnosis: Diagnosis; language: Language }) {
  const t = messages[language];
  return (
    <section className="compass-card diagnosis-card" aria-labelledby="diagnosis-title">
      <span className="card-kicker">{t.diagnosisKicker}</span>
      <h3 id="diagnosis-title">{t.diagnosisTitle}</h3>
      <p className="core-issue"><strong>{t.coreIssue}</strong>{displayReadingText(diagnosis.coreIssue)}</p>
      {diagnosis.gaps.length > 0 && (
        <>
          <h4>{t.gapTitle}</h4>
          <ul className="gap-list">
            {diagnosis.gaps.map((gap, index) => (
              <li key={index} className="gap-row">
                <div className="gap-head">
                  <span className="gap-skill"><span className="visually-hidden">{t.gapSkill}: </span>{displayReadingText(gap.skill)}</span>
                  <span className={`gap-badge gap-${gap.level}`}><span className="visually-hidden">{t.gapLevel}: </span>{levelLabel(t, gap.level)}</span>
                </div>
                <p><span className="gap-label">{t.gapEvidence}</span>{displayReadingText(gap.evidence)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function readChecks(key: string, size: number): boolean[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || "[]");
    if (Array.isArray(saved)) return Array.from({ length: size }, (_, index) => saved[index] === true);
  } catch {
    // 저장소를 쓸 수 없는 환경에서는 체크 상태를 이 화면에서만 유지한다.
  }
  return Array(size).fill(false);
}

export function WeekChecklist({ tasks, storageKey, basic, language }: { tasks: string[]; storageKey: string; basic: boolean; language: Language }) {
  const t = messages[language];
  const key = `career-compass-week:${storageKey}`;
  const [checks, setChecks] = useState<boolean[]>(() => Array(tasks.length).fill(false));
  useEffect(() => { setChecks(readChecks(key, tasks.length)); }, [key, tasks.length]);
  function toggle(index: number) {
    setChecks((current) => {
      const next = current.map((value, position) => (position === index ? !value : value));
      try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* 저장 실패 시 화면 상태만 유지 */ }
      return next;
    });
  }
  const done = checks.filter(Boolean).length;
  return (
    <section className="compass-card week-card" aria-labelledby="week-title">
      <div className="compass-head">
        <span className="card-kicker">{t.weekKicker}</span>
        {basic && <BasicBadge t={t} />}
      </div>
      <h3 id="week-title">{t.weekTitle}</h3>
      <p className="compass-intro">{t.weekIntro}</p>
      <p className="week-progress" aria-live="polite">{done}/{tasks.length} {t.weekProgress}</p>
      <ul className="week-list">
        {tasks.map((task, index) => (
          <li key={index}>
            <label className="week-item">
              <input type="checkbox" checked={checks[index] || false} onChange={() => toggle(index)} />
              <span>{displayReadingText(task)}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CopyButton({ value, language }: { value: string; language: Language }) {
  const t = messages[language];
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2000);
  }
  return (
    <button type="button" className="copy-button" onClick={copy} aria-live="polite">
      {state === "copied" ? t.copied : state === "failed" ? t.copyFailed : t.copy}
    </button>
  );
}

export function ResumeLines({ lines, language }: { lines: string[]; language: Language }) {
  const t = messages[language];
  return (
    <section className="compass-card resume-card" aria-labelledby="resume-title">
      <span className="card-kicker">{t.resumeKicker}</span>
      <h3 id="resume-title">{t.resumeTitle}</h3>
      <p className="compass-intro">{t.resumeIntro}</p>
      <ul className="resume-list">
        {lines.map((line, index) => {
          const clean = displayReadingText(line);
          return (
            <li key={index}>
              <p>{clean}</p>
              <CopyButton value={clean} language={language} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function InterviewList({ items, basic, language }: { items: Interview[]; basic: boolean; language: Language }) {
  const t = messages[language];
  return (
    <section className="compass-card interview-card" aria-labelledby="interview-title">
      <div className="compass-head">
        <span className="card-kicker">{t.interviewKicker}</span>
        {basic && <BasicBadge t={t} />}
      </div>
      <h3 id="interview-title">{t.interviewTitle}</h3>
      <ol className="qa-list">
        {items.map((item, index) => (
          <li key={index}>
            <strong>{displayReadingText(item.question)}</strong>
            <p><span className="qa-label">{t.interviewTip}</span>{displayReadingText(item.tip)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function RiskList({ items, basic, language }: { items: Risk[]; basic: boolean; language: Language }) {
  const t = messages[language];
  return (
    <section className="compass-card risk-card" aria-labelledby="risk-title">
      <div className="compass-head">
        <span className="card-kicker">{t.riskKicker}</span>
        {basic && <BasicBadge t={t} />}
      </div>
      <h3 id="risk-title">{t.riskTitle}</h3>
      <ul className="qa-list">
        {items.map((item, index) => (
          <li key={index}>
            <strong>{displayReadingText(item.risk)}</strong>
            <p><span className="qa-label">{t.riskResponse}</span>{displayReadingText(item.response)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const categoryKeys: Record<ResourceCategory, keyof Messages> = {
  jobs: "categoryJobs",
  support: "categorySupport",
  learning: "categoryLearning",
  certificate: "categoryCertificate",
  contest: "categoryContest",
  portfolio: "categoryPortfolio",
  network: "categoryNetwork",
  research: "categoryResearch",
};

function safeHttps(url: string) {
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function ResourceList({ resources, searchLinks, language }: { resources: SelectedResource[]; searchLinks: SearchLink[]; language: Language }) {
  const t = messages[language];
  const groups = new Map<ResourceCategory, SelectedResource[]>();
  for (const resource of resources) {
    if (!safeHttps(resource.url)) continue;
    groups.set(resource.category, [...(groups.get(resource.category) || []), resource]);
  }
  const orderedGroups = (Object.keys(categoryKeys) as ResourceCategory[])
    .filter((category) => groups.has(category))
    .map((category) => [category, groups.get(category)!] as const);
  const links = searchLinks.filter((link) => safeHttps(link.url));
  if (orderedGroups.length === 0 && links.length === 0) return null;
  return (
    <section className="compass-card resource-card" aria-labelledby="resource-title">
      <span className="card-kicker">{t.resourceKicker}</span>
      <h3 id="resource-title">{t.resourceTitle}</h3>
      <p className="compass-intro">{t.resourceIntro}</p>
      {links.length > 0 && (
        <div className="search-links">
          <h4>{t.searchTitle}</h4>
          <ul>
            {links.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.site}<span className="visually-hidden"> ({t.newTab})</span><span aria-hidden="true"> ↗</span>
                </a>
              </li>
            ))}
          </ul>
          <small>{t.searchHint}</small>
        </div>
      )}
      <div className="resource-groups">
        {orderedGroups.map(([category, items]) => (
          <div key={category} className="resource-group">
            <h4>{t[categoryKeys[category]]}</h4>
            <ul>
              {items.map((resource) => (
                <li key={resource.id} className="resource-item">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.name}<span className="visually-hidden"> ({t.newTab})</span><span aria-hidden="true"> ↗</span>
                  </a>
                  {resource.source === "ai" && <span className="resource-ai">{t.aiPick}</span>}
                  <p>{displayReadingText(resource.reason)}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
