"use client";

import { useEffect, useRef, useState } from "react";
import { displayReadingText, type SajuReading } from "../lib/career/guidance";
import { messages, type Language } from "./i18n";

export type SavedInsight = SajuReading & { id: string; created_at: string };

export function insightNarration(reading: SajuReading) {
  return [reading.summary, ...reading.strengths, ...reading.cautions, reading.reflection]
    .map(displayReadingText).filter(Boolean).join("\n\n");
}

function Narrator({ reading, language }: { reading?: SavedInsight; language: Language }) {
  const ko = language === "ko";
  const text = reading ? insightNarration(reading) : ko ? "아직 발견하지 못한 가능성이 기다리고 있어요. 위에서 커리어 인사이트를 만들면, 제가 함께 읽어드릴게요." : "Your next possibility is waiting. Create a career insight above, and I’ll explore it with you.";
  const characters = Array.from(text);
  const [visible, setVisible] = useState(characters.length);
  const [typing, setTyping] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const bubble = useRef<HTMLParagraphElement | null>(null);
  const reduced = useRef(false);
  const run = useRef(0);

  useEffect(() => {
    if (typing && bubble.current) bubble.current.scrollTop = bubble.current.scrollHeight;
  }, [visible, typing]);

  function clearTyping() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }

  function cancel() {
    run.current += 1;
    clearTyping();
    if (utterance.current && "speechSynthesis" in window) window.speechSynthesis.cancel();
    utterance.current = null;
    request.current?.abort();
    request.current = null;
    audio.current?.pause();
  }

  function typeText() {
    clearTyping();
    if (reduced.current) { setVisible(characters.length); setTyping(false); return; }
    setVisible(0);
    setTyping(true);
    let index = 0;
    // Keep even long readings bounded to 45 seconds when speech events are unavailable.
    timer.current = setInterval(() => {
      index += 1;
      setVisible(index);
      if (index >= characters.length) { clearTyping(); setTyping(false); }
    }, Math.min(35, 45000 / Math.max(characters.length, 1)));
  }

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = preference.matches;
    function change() {
      reduced.current = preference.matches;
      if (preference.matches) { clearTyping(); setVisible(characters.length); setTyping(false); }
    }
    preference.addEventListener("change", change);
    if (reading) typeText();
    return () => {
      cancel();
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
      preference.removeEventListener("change", change);
    };
    // The parent keys each narrator by reading content and interface language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function play() {
    cancel();
    setSpeaking(false);
    typeText();
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      const currentRun = run.current;
      setStatus(ko ? "쿼카의 목소리를 준비하고 있어요…" : "Preparing Quokka’s voice…");
      try {
        if (!audio.current) {
          const controller = new AbortController();
          request.current = controller;
          const response = await fetch("/api/narrate", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, language: /[가-힣]/.test(text) ? "ko" : "en" }), signal: controller.signal,
          });
          if (!response.ok) throw new Error("Narration unavailable");
          const blob = await response.blob();
          if (currentRun !== run.current) return;
          audioUrl.current = URL.createObjectURL(blob);
          audio.current = new Audio(audioUrl.current);
        }
        const player = audio.current;
        player.currentTime = 0;
        player.onplay = () => {
          if (currentRun !== run.current) return;
          clearTyping(); setTyping(!reduced.current); setSpeaking(true); setVisible(reduced.current ? characters.length : 0);
          setStatus(ko ? "쿼카가 나의 가능성을 읽고 있어요." : "Quokka is reading your possibilities.");
          if (!reduced.current) timer.current = setInterval(() => {
            if (currentRun !== run.current || !Number.isFinite(player.duration) || !player.duration) return;
            const target = Math.min(characters.length, Math.ceil(player.currentTime / player.duration * characters.length));
            setVisible((previous) => previous < target ? previous + 1 : previous);
          }, 25);
        };
        player.onended = () => {
          if (currentRun !== run.current) return;
          clearTyping(); setSpeaking(false); setTyping(false); setVisible(characters.length);
          setStatus(ko ? "작은 도전부터 함께 시작해봐요." : "Let’s start with one small step.");
        };
        player.onerror = () => {
          if (currentRun !== run.current) return;
          clearTyping(); setSpeaking(false); setTyping(false); setVisible(characters.length);
          if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
          audioUrl.current = null; audio.current = null;
          setStatus(ko ? "음성을 재생하지 못했어요. 글로 확인하거나 다시 듣기를 눌러주세요." : "Audio could not play. Read along or try listening again.");
        };
        try { await player.play(); }
        catch {
          if (currentRun !== run.current) return;
          setSpeaking(false);
          setStatus(ko ? "음성이 준비됐어요. 처음부터 듣기를 한 번 더 눌러 재생해주세요." : "Your audio is ready. Press Listen from the start again to play.");
        }
      } catch {
        if (currentRun !== run.current) return;
        setSpeaking(false);
        setStatus(ko ? "음성을 준비하지 못했어요. 글로 계속 확인하거나 다시 듣기를 눌러주세요." : "Audio is unavailable. Keep reading or try listening again.");
      }
      return;
    }
    const currentRun = run.current;
    const speech = new SpeechSynthesisUtterance(text);
    utterance.current = speech;
    speech.lang = /[가-힣]/.test(text) ? "ko-KR" : "en-US";
    const voices = window.speechSynthesis.getVoices().filter((item) => item.lang.toLowerCase().startsWith(speech.lang.slice(0, 2)));
    const voice = voices.find((item) => item.localService) ?? voices[0];
    if (voice) speech.voice = voice;
    speech.rate = 1;
    setStatus(ko ? "음성을 준비하고 있어요. 기기의 기본 목소리로 읽어드려요." : "Preparing your device’s reading voice.");
    speech.onstart = () => {
      if (currentRun !== run.current) return;
      setSpeaking(true);
      setStatus(ko ? "쿼카가 나의 가능성을 읽고 있어요." : "Quokka is reading your possibilities.");
    };
    speech.onend = () => {
      if (currentRun !== run.current) return;
      clearTyping(); setTyping(false); setSpeaking(false); setVisible(characters.length);
      utterance.current = null;
      setStatus(ko ? "작은 도전부터 함께 시작해봐요." : "Let’s start with one small step.");
    };
    speech.onerror = () => {
      if (currentRun !== run.current) return;
      setSpeaking(false); utterance.current = null;
      setStatus(ko ? "음성을 재생하지 못했어요. 글로 계속 확인하거나 다시 듣기를 눌러주세요." : "Audio could not play. Keep reading or try listening again.");
    };
    try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(speech); }
    catch { speech.onerror?.({} as SpeechSynthesisErrorEvent); }
  }

  function stop() {
    cancel(); setTyping(false); setSpeaking(false); setVisible(characters.length);
    setStatus(ko ? "재생을 멈췄어요. 전체 내용을 편하게 읽어보세요." : "Playback stopped. The full insight is ready to read.");
  }

  return <>
    <div className={`insight-scene${speaking ? " is-speaking" : ""}`}>
      <div className="insight-character" aria-hidden="true">
        <span className="insight-spark insight-spark-one">✦</span>
        <span className="insight-spark insight-spark-two">✧</span>
        <div className="insight-portrait">
          <img className="insight-face" src="/quokka-original-v02.png" alt="" width="486" height="443" />
          <img className="insight-talking-face" src="/quokka-laugh-v02.png" alt="" width="486" height="443" />
        </div>
        <span className="insight-guide-name">QUOKKA · YOUR CAREER BUDDY</span>
        <div className="insight-voice-wave"><i /><i /><i /><i /><i /></div>
      </div>
      <div className="insight-dialogue">
        <span className="card-kicker">{ko ? "쿼카가 들려주는 나의 가능성" : "Your potential, told by Quokka"}</span>
        <p ref={bubble} className="insight-typed" aria-hidden="true">{characters.slice(0, visible).join("")}{typing && <span className="insight-cursor">▍</span>}</p>
        {!reading && <p className="insight-screen-reader">{text}</p>}
        {reading && <div className="insight-controls">
          <button type="button" onClick={play}>{ko ? "▶ 처음부터 듣기" : "▶ Listen from the start"}</button>
          <button type="button" className="secondary-button" onClick={stop}>{ko ? "■ 멈추고 전체 보기" : "■ Stop & show all"}</button>
        </div>}
        <p className="insight-status" role="status">{status || (reading ? ko ? "듣기를 누르면 기기의 음성으로 읽어드려요." : "Press Listen to hear your device’s voice." : "")}</p>
        {reading && <p className="insight-status">{ko ? "기기 음성을 사용할 수 없으면, 음성 생성을 위해 선택한 인사이트가 Google AI에 전달됩니다." : "If device speech is unavailable, your selected insight is sent to Google AI to generate audio."}</p>}
      </div>
    </div>
    {reading && <details className="insight-transcript">
      <summary>{ko ? "전체 인사이트 읽기" : "Read the complete insight"}</summary>
      <p>{displayReadingText(reading.summary)}</p>
      <h3>{messages[language].strengths}</h3>
      <ul>{reading.strengths.map((item, index) => <li key={index}>{displayReadingText(item)}</li>)}</ul>
      <h3>{messages[language].growth}</h3>
      <ul>{reading.cautions.map((item, index) => <li key={index}>{displayReadingText(item)}</li>)}</ul>
      <h3>{messages[language].reflection}</h3>
      <p>{displayReadingText(reading.reflection)}</p>
      <p className="interpretation-note">{messages[language].readingNote}</p>
    </details>}
  </>;
}

export default function QuokkaInsights({ readings, language, error }: { readings: SavedInsight[]; language: Language; error: string }) {
  const [selectedId, setSelectedId] = useState("");
  const selected = readings.find((reading) => reading.id === selectedId) ?? readings[0];
  const t = messages[language];
  return <section className="saved-section insight-studio" aria-labelledby="saved-title">
    <div className="insight-heading">
      <div><span className="eyebrow">{t.myReadings}</span><h2 id="saved-title">{t.savedTitle}</h2><p>{t.savedLanguage}</p></div>
      {readings.length > 0 && <div className="insight-picker">
        <label htmlFor="insight-selection">{language === "ko" ? "다시 듣고 싶은 인사이트" : "Choose an insight"}</label>
        <select id="insight-selection" value={selected?.id} onChange={(event) => setSelectedId(event.target.value)}>
          {readings.map((reading) => <option key={reading.id} value={reading.id}>{new Date(reading.created_at).toLocaleString(language === "ko" ? "ko-KR" : "en-US", { timeZone: "Asia/Seoul" })} · {displayReadingText(reading.summary).slice(0, 45)}</option>)}
        </select>
      </div>}
    </div>
    {error && <p className="error" role="alert">{error}</p>}
    <Narrator key={`${language}-${selected ? JSON.stringify(selected) : "empty"}`} reading={selected} language={language} />
  </section>;
}
