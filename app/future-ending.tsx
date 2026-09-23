type CareerQuote = { text: string; attribution?: string; sourceUrl?: string; connection?: string };

export default function FutureEnding({
  age,
  nearbyAges,
  quote,
  language,
}: {
  age: number;
  nearbyAges: number[];
  quote: CareerQuote;
  language: "ko" | "en";
}) {
  const english = language === "en";
  return (
    <section className="future-section" aria-labelledby="future-title">
      <span className="eyebrow">YOUR FUTURE</span>
      <h2 id="future-title">{english ? "Your path is yours to create" : "내일의 길은 오늘의 내가 만듭니다"}</h2>
      <p className="future-intro">
        {english
          ? `At ${age}, your next career chapter begins with the choice you make today.`
          : `만 ${age}세의 지금, 다음 커리어는 오늘의 선택에서 시작됩니다.`}
      </p>
      <figure className="future-visual">
        <div className="future-copy">
          <span className="future-kicker">{english ? "A SAYING FOR YOUR CONCERN" : "내 고민과 연결한 격언"}</span>
          <blockquote>{quote.text}</blockquote>
          {quote.connection && <p className="future-connection">{quote.connection}</p>}
          {quote.attribution && (
            <p className="future-attribution">
              {quote.sourceUrl ? (
                <a href={quote.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {quote.attribution} ↗
                </a>
              ) : quote.attribution}
            </p>
          )}
        </div>
        <figcaption className="future-ages">
          {nearbyAges.map((peerAge, index) => (
            <span className="future-age" key={index}>
              <strong>{english ? `${peerAge} years` : `${peerAge}세`}</strong>
            </span>
          ))}
        </figcaption>
      </figure>
    </section>
  );
}
