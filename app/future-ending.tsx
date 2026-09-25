import "./quotes.css";
import type { CareerQuote } from "../lib/career/quotes";

// 저장된 예전 결과에는 id·번역이 없을 수 있어 선택 항목으로 받는다.
type DisplayQuote = Omit<CareerQuote, "id"> & { id?: string };

function Source({ quote, english }: { quote: DisplayQuote; english: boolean }) {
  if (!quote.attribution) return null;
  return (
    <p className="future-attribution">
      <span className="future-source-label">{english ? "Source" : "출처"}</span>
      {quote.sourceUrl ? (
        <a href={quote.sourceUrl} target="_blank" rel="noopener noreferrer">{quote.attribution} ↗</a>
      ) : quote.attribution}
    </p>
  );
}

function Saying({ kicker, saying, english }: { kicker: string; saying: DisplayQuote; english: boolean }) {
  return (
    <div className="future-saying">
      <span className="future-kicker">{kicker}</span>
      <blockquote lang="en">{saying.text}</blockquote>
      {!english && saying.translation && <p className="future-translation" lang="ko">{saying.translation}</p>}
      {saying.connection && (
        <p className="future-connection">
          <span className="future-connection-label">{english ? "TODAY'S STEP" : "오늘의 한 걸음"}</span>
          {saying.connection}
        </p>
      )}
      <Source quote={saying} english={english} />
    </div>
  );
}

export default function FutureEnding({
  quote,
  motivation,
  language,
}: {
  quote: DisplayQuote;
  motivation: DisplayQuote;
  language: "ko" | "en";
}) {
  const english = language === "en";
  return (
    <section className="future-section" aria-labelledby="future-title">
      <span className="eyebrow">YOUR FUTURE</span>
      <figure className="future-visual">
        <div className="future-copy">
          <h2 id="future-title">{english ? "I create tomorrow through what I do today" : "내일의 나는 오늘의 내가 만듭니다"}</h2>
          <div className="future-sayings">
            <Saying kicker={english ? "A QUOTE FOR YOUR NEXT STEP" : "내 고민과 연결한 명언"} saying={motivation} english={english} />
            <Saying kicker={english ? "A PROVERB FOR YOUR CONCERN" : "내 고민과 연결한 격언"} saying={quote} english={english} />
          </div>
        </div>
      </figure>
    </section>
  );
}
