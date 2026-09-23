type CareerQuote = { text: string; attribution?: string; sourceUrl?: string; connection?: string };

function Source({ quote }: { quote: CareerQuote }) {
  if (!quote.attribution) return null;
  return (
    <p className="future-attribution">
      {quote.sourceUrl ? (
        <a href={quote.sourceUrl} target="_blank" rel="noopener noreferrer">{quote.attribution} ↗</a>
      ) : quote.attribution}
    </p>
  );
}

export default function FutureEnding({
  quote,
  motivation,
  language,
}: {
  quote: CareerQuote;
  motivation: CareerQuote;
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
            <div>
              <span className="future-kicker">{english ? "A QUOTE FOR YOUR NEXT STEP" : "내 고민과 연결한 명언"}</span>
              <blockquote>{motivation.text}</blockquote>
              <Source quote={motivation} />
            </div>
            <div>
              <span className="future-kicker">{english ? "A PROVERB FOR YOUR CONCERN" : "내 고민과 연결한 격언"}</span>
              <blockquote>{quote.text}</blockquote>
              {quote.connection && <p className="future-connection">{quote.connection}</p>}
              <Source quote={quote} />
            </div>
          </div>
        </div>
      </figure>
    </section>
  );
}
