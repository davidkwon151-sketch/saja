"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import type { Interview, PlanStep, Risk } from "../lib/career/plan";
import { todayInKorea } from "../lib/career/plan";
import { displayReadingText, type Diagnosis, type SajuReading } from "../lib/career/guidance";
import type { SearchLink, SelectedResource } from "../lib/career/resources";
import { readRecentQuoteIds, rememberQuoteIds } from "../lib/career/recent-quotes";
import { supabase } from "../lib/supabase/client";
import { messages, type Language } from "./i18n";
import FutureEnding from "./future-ending";
import QuokkaInsights from "./quokka-insights";
import {
  DiagnosisCard,
  InterviewList,
  ResourceList,
  ResumeLines,
  RiskList,
  WeekChecklist,
  hashResult,
} from "./compass-sections";
import "./compass.css";

type Saying = { id?: string; text: string; translation?: string; attribution?: string; sourceUrl?: string; connection?: string };

type Result = {
  chart: {
    pillars: Array<{ label: string; korean: string }>;
    dayMaster: { korean: string; element: string };
    method: string;
  };
  steps: PlanStep[];
  reading: SajuReading | null;
  planSource: "ai" | "basic";
  age: number;
  nearbyAges: number[];
  quote: Saying;
  motivation: Saying;
  diagnosis?: Diagnosis | null;
  firstWeek?: string[];
  resumeLines?: string[];
  interview?: Interview[];
  risks?: Risk[];
  basicSections?: string[];
  resources?: SelectedResource[];
  searchLinks?: SearchLink[];
};

type SavedReading = SajuReading & { id: string; created_at: string };

function ReadingContent({ reading, language }: { reading: SajuReading; language: Language }) {
  const t = messages[language];
  return (
    <>
      <p className="interpretation-summary">{displayReadingText(reading.summary)}</p>
      <div className="interpretation-details">
        <div>
          <h4>{t.strengths}</h4>
          <ul>{reading.strengths.map((item, index) => <li key={index}>{displayReadingText(item)}</li>)}</ul>
        </div>
        <div>
          <h4>{t.growth}</h4>
          <ul>{reading.cautions.map((item, index) => <li key={index}>{displayReadingText(item)}</li>)}</ul>
        </div>
      </div>
      <p className="reflection"><strong>{t.reflection}</strong>{displayReadingText(reading.reflection)}</p>
      <p className="interpretation-note">{t.readingNote}</p>
    </>
  );
}

export default function SajuForm({ language }: { language: Language }) {
  const t = messages[language];
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetPreset, setTargetPreset] = useState(0);
  const today = todayInKorea();
  const tomorrow = new Date(Date.parse(`${today}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
  const currentYear = Number(today.slice(0, 4));
  const daysInBirthMonth = birthMonth
    ? new Date(Number(birthYear || "2000"), Number(birthMonth), 0).getDate()
    : 31;

  function chooseTarget(months: number) {
    const [year, month, day] = today.split("-").map(Number);
    const first = new Date(Date.UTC(year, month - 1 + months, 1));
    const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    first.setUTCDate(Math.min(day, lastDay));
    setTargetDate(first.toISOString().slice(0, 10));
    setTargetPreset(months);
  }
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [authError, setAuthError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [historyRevision, setHistoryRevision] = useState(0);
  const resultTitle = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setAuthReady(true);
      if (sessionError) setAuthError(messages[language].authCheckError);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
      if (event === "SIGNED_OUT") {
        setResult(null);
        setSavedReadings([]);
        setSaveMessage("");
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [language]);

  useEffect(() => {
    if (!supabase || !user) return;
    let active = true;
    supabase.from("saju_readings")
      .select("id, created_at, summary, strengths, cautions, reflection")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) setHistoryError(messages[language].historyError);
        else { setSavedReadings(data || []); setHistoryError(""); }
      });
    return () => { active = false; };
  }, [user, historyRevision, language]);

  async function signIn() {
    if (!supabase) return;
    setAuthError("");
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
    if (signInError) setAuthError(t.signInError);
  }

  async function signOut() {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setAuthError(t.signOutError);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setSaveMessage("");
    const data = new FormData(event.currentTarget);
    const input = {
      ...Object.fromEntries(data.entries()),
      birthDate: `${String(data.get("birthYear")).padStart(4, "0")}-${data.get("birthMonth")}-${data.get("birthDay")}`,
      language,
      recentQuoteIds: readRecentQuoteIds(),
    };
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || t.planError);
      const nextResult = body as Result;
      setResult(nextResult);
      rememberQuoteIds([nextResult.quote?.id, nextResult.motivation?.id].filter((id): id is string => Boolean(id)));
      requestAnimationFrame(() => resultTitle.current?.focus());
      if (nextResult.reading && user && supabase) {
        setSaveMessage(t.saving);
        const { error: saveError } = await supabase.from("saju_readings").insert({
          user_id: user.id,
          summary: nextResult.reading.summary,
          strengths: nextResult.reading.strengths,
          cautions: nextResult.reading.cautions,
          reflection: nextResult.reading.reflection,
        });
        if (saveError) setSaveMessage(t.saveError);
        else { setSaveMessage(t.saved); setHistoryRevision((value) => value + 1); }
      } else if (nextResult.reading && !user) {
        setSaveMessage(t.anonymous);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.retry);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="account-card" aria-label={t.account}>
        <div>
          <strong>{user ? t.accountOn : t.accountOff}</strong>
          <p>{user ? user.email : t.accountHelp}</p>
        </div>
        {!supabase ? (
          <p className="account-notice">{t.noConnection}</p>
        ) : !authReady ? (
          <p className="account-notice">{t.checkingAuth}</p>
        ) : user ? (
          <button type="button" className="secondary-button" onClick={signOut}>{t.signOut}</button>
        ) : (
          <button type="button" className="secondary-button" onClick={signIn}>{t.signIn}</button>
        )}
        {authError && <p className="account-error" role="alert">{authError}</p>}
      </section>

      <section className="input-card" aria-labelledby="input-title">
        <div className="section-heading">
          <span className="eyebrow">{t.stepOne}</span>
          <h2 id="input-title">{t.inputTitle}</h2>
          <p>{t.inputIntro}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field full">
            <label htmlFor="concern">{t.concernLabel}</label>
            <textarea
              id="concern"
              name="concern"
              rows={4}
              maxLength={500}
              placeholder={t.concernPlaceholder}
              required
            />
            <small>{t.privacyHint}</small>
          </div>
          <div className="field">
            <fieldset className="birth-date-field">
              <legend>{t.birthDate}</legend>
              <div className="birth-date-parts">
                <div>
                  <label htmlFor="birthYear">{t.birthYear}</label>
                  <input id="birthYear" name="birthYear" type="number" inputMode="numeric" min="1900" max={currentYear} placeholder={String(currentYear - 25)} value={birthYear} onChange={(event) => setBirthYear(event.target.value)} required />
                </div>
                <div>
                  <label htmlFor="birthMonth">{t.birthMonth}</label>
                  <select id="birthMonth" name="birthMonth" value={birthMonth} onChange={(event) => setBirthMonth(event.target.value)} required>
                    <option value="">{t.chooseDate}</option>
                    {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={String(index + 1).padStart(2, "0")}>{index + 1}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="birthDay">{t.birthDay}</label>
                  <select key={`${birthYear}-${birthMonth}`} id="birthDay" name="birthDay" defaultValue="" required>
                    <option value="">{t.chooseDate}</option>
                    {Array.from({ length: daysInBirthMonth }, (_, index) => <option key={index + 1} value={String(index + 1).padStart(2, "0")}>{index + 1}</option>)}
                  </select>
                </div>
              </div>
            </fieldset>
            <small>{t.birthHint}</small>
          </div>
          <div className="field">
            <label htmlFor="targetDate">{t.targetDate}</label>
            <div className="target-presets" role="group" aria-label={t.targetQuickSelect}>
              {[3, 6, 12].map((months) => (
                <button key={months} type="button" className="target-preset" aria-pressed={targetPreset === months} onClick={() => chooseTarget(months)} aria-label={language === "ko" ? `오늘부터 ${months}개월 뒤 입사 목표일 선택` : `Set target start date ${months} months from today`}>
                  {months === 12 ? t.targetYear : language === "ko" ? `${months}개월 뒤` : `In ${months} months`}
                </button>
              ))}
            </div>
            <input id="targetDate" name="targetDate" type="date" min={tomorrow} value={targetDate} onChange={(event) => { setTargetDate(event.target.value); setTargetPreset(0); }} required />
            <small>{t.targetHint}</small>
          </div>
          <div className="field">
            <label htmlFor="role">{t.role}</label>
            <input id="role" name="role" type="text" maxLength={80} placeholder={t.rolePlaceholder} required />
          </div>
          <div className="field">
            <label htmlFor="status">{t.status}</label>
            <select id="status" name="status" defaultValue="" required>
              <option value="" disabled>{t.chooseStatus}</option>
              <option value="취업 준비 중">{t.statusPreparing}</option>
              <option value="재직 중 이직 준비">{t.statusEmployed}</option>
              <option value="재취업 준비 중">{t.statusReturning}</option>
            </select>
          </div>
          <div className="form-bottom full">
            <p>{t.dataNotice}</p>
            <button type="submit" disabled={loading} aria-busy={loading}>
              {loading ? t.loadingButton : t.submit}
            </button>
          </div>
        </form>
        <div aria-live="polite" className="feedback">
          {loading && <p className="loading">{t.loading}</p>}
          {error && <p className="error" role="alert">{error}</p>}
        </div>
      </section>

      {result && (
        <section className="results" aria-labelledby="result-title">
          <div className="result-intro">
            <span className="eyebrow">{t.stepTwo}</span>
            <h2 id="result-title" ref={resultTitle} tabIndex={-1}>{t.resultTitle}</h2>
            <p>{t.resultIntro}</p>
          </div>

          <section className="interpretation-card" aria-labelledby="interpretation-title">
            <span className="card-kicker">{t.readingKicker}</span>
            <h3 id="interpretation-title">{t.readingTitle}</h3>
            {result.reading ? (
              <ReadingContent reading={result.reading} language={language} />
            ) : (
              <p className="interpretation-summary">{t.noReading}</p>
            )}
            {saveMessage && <p className="save-message" role="status">{saveMessage}</p>}
          </section>

          {result.diagnosis && <DiagnosisCard diagnosis={result.diagnosis} language={language} />}

          <div className="section-heading plan-heading">
            <span className="eyebrow">{t.planKicker}</span>
            <h3>{t.planTitle}</h3>
            <p>
              {result.planSource === "ai"
                ? t.aiPlan
                : t.basicPlan}
            </p>
          </div>
          <ol className="plan-list">
            {result.steps.map((step, index) => (
              <li key={index} className="plan-step">
                <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <span className="period">{displayReadingText(step.period)}</span>
                  <h4>{displayReadingText(step.title)}</h4>
                  <ul>{step.actions.map((action, actionIndex) => <li key={actionIndex}>{displayReadingText(action)}</li>)}</ul>
                  {step.milestone && (
                    <p className="milestone"><strong>{t.milestone}</strong>{displayReadingText(step.milestone)}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="compass-extras">
            {result.firstWeek && result.firstWeek.length > 0 && (
              <WeekChecklist
                tasks={result.firstWeek}
                storageKey={hashResult([result.firstWeek, result.steps.map((step) => step.title)])}
                basic={result.basicSections?.includes("firstWeek") ?? result.planSource === "basic"}
                language={language}
              />
            )}
            {result.resumeLines && result.resumeLines.length > 0 && (
              <ResumeLines lines={result.resumeLines} language={language} />
            )}
            {result.interview && result.interview.length > 0 && (
              <InterviewList
                items={result.interview}
                basic={result.basicSections?.includes("interview") ?? result.planSource === "basic"}
                language={language}
              />
            )}
            {result.risks && result.risks.length > 0 && (
              <RiskList
                items={result.risks}
                basic={result.basicSections?.includes("risks") ?? result.planSource === "basic"}
                language={language}
              />
            )}
            {((result.resources && result.resources.length > 0) || (result.searchLinks && result.searchLinks.length > 0)) && (
              <ResourceList resources={result.resources || []} searchLinks={result.searchLinks || []} language={language} />
            )}
          </div>

        </section>
      )}

      {user && <QuokkaInsights readings={savedReadings} language={language} error={historyError} />}
      {result && <FutureEnding quote={result.quote} motivation={result.motivation} language={language} />}
    </>
  );
}
