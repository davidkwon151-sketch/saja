"use client";

import { useEffect, useState } from "react";
import SajuForm from "./saju-form";
import { messages, type Language } from "./i18n";
import QuokkaGuide from "./quokka-guide";

// 첫 화면 안내 문구 (spec 014). i18n.ts로 옮길 수 있도록 같은 키 이름을 쓴다.
const heroCopy = {
  ko: {
    heroCta: "지금 고민 적어보기",
    heroMeta: "로그인 없이 · 약 1분 · 출생시간 불필요",
    heroStepsLabel: "진행 순서",
    heroSteps: ["고민과 목표일 적기", "나의 강점과 체크포인트 읽기", "목표일까지 3단계 계획 받기"],
  },
  en: {
    heroCta: "Start with your concern",
    heroMeta: "No sign-in needed · About 1 minute · No birth time",
    heroStepsLabel: "How it works",
    heroSteps: ["Share your concern and target date", "Read your strengths and checkpoints", "Get a 3-step plan to your date"],
  },
} as const;

export default function Page() {
  const [language, setLanguage] = useState<Language>("ko");
  useEffect(() => {
    const saved = window.localStorage.getItem("career-compass-language");
    if (saved === "ko" || saved === "en") setLanguage(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("career-compass-language", language);
    document.title = language === "ko" ? "커리어 나침반" : "Career Compass";
  }, [language]);
  const t = messages[language];
  const hero = heroCopy[language];

  return (
    <main>
      <header className="page-header">
        <div className="header-top">
          <span className="brand-mark">{t.brand}</span>
          <div className="language-switch" role="group" aria-label="언어 선택 / Language">
            <button type="button" className="language-option" aria-pressed={language === "ko"} onClick={() => setLanguage("ko")}>한국어</button>
            <button type="button" className="language-option" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
          </div>
        </div>
        <div className="hero-content">
          <div>
            <span className="eyebrow">{t.heroEyebrow}</span>
            <h1>{t.heroTitle}</h1>
            <p className="intro">{t.heroIntro}</p>
            <div className="hero-actions">
              <a className="hero-cta" href="#input-title">{hero.heroCta}</a>
              <span className="hero-meta">{hero.heroMeta}</span>
            </div>
            <ol className="hero-steps" aria-label={hero.heroStepsLabel}>
              {hero.heroSteps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <QuokkaGuide language={language} />
        </div>
      </header>
      <SajuForm language={language} />
      <footer>
        <span className="footer-brand">{t.brand}</span>
        <p>{t.footer}</p>
      </footer>
    </main>
  );
}
