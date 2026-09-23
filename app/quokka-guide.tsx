"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { messages, type Language } from "./i18n";

export default function QuokkaGuide({ language }: { language: Language }) {
  const [hovered, setHovered] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [burst, setBurst] = useState(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const happy = hovered || greeted;
  const t = messages[language];

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    if (burstTimer.current) clearTimeout(burstTimer.current);
  }, []);

  function greet() {
    setGreeted(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    if (burstTimer.current) clearTimeout(burstTimer.current);
    resetTimer.current = setTimeout(() => setGreeted(false), 1800);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBurst((value) => value + 1);
      burstTimer.current = setTimeout(() => setBurst(0), 900);
    }
  }

  return (
    <div className="quokka-scene">
      <button
        className={`quokka-character${happy ? " is-happy" : ""}`}
        type="button"
        aria-label={t.quokkaGreet}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" || event.pointerType === "pen") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onClick={greet}
      >
        <img className="quokka-original" src="/quokka-original-v02.png" width="486" height="443" alt="" draggable={false} />
        <img className="quokka-laugh" src="/quokka-laugh-v02.png" width="1329" height="1198" alt="" draggable={false} />
      </button>
      <span className={`quokka-bubble${happy ? " is-visible" : ""}`} aria-hidden="true">{t.quokkaBubble}</span>
      {burst > 0 && Array.from({ length: 9 }, (_, index) => {
        const angle = index * Math.PI * 2 / 9;
        const style = {
          "--x": `${Math.cos(angle) * 140}px`,
          "--y": `${Math.sin(angle) * 115}px`,
          "--turn": `${index * 37}deg`,
        } as CSSProperties;
        return <span className="quokka-particle" style={style} key={`${burst}-${index}`} aria-hidden="true">{index % 3 === 0 ? "♡" : "✦"}</span>;
      })}
      <p className="quokka-caption" role="status" aria-live="polite">{happy ? t.quokkaHappy : t.quokkaWaiting}</p>
    </div>
  );
}
