"use client";

import { useEffect, useState } from "react";
import SajuForm from "./saju-form";
import { messages, type Language } from "./i18n";
import QuokkaGuide from "./quokka-guide";

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
          </div>
          <QuokkaGuide language={language} />
        </div>
      </header>
      <SajuForm language={language} />
      <footer>{t.footer}</footer>
    </main>
  );
}
