type QuoteInput = {
  age: number;
  concern: string;
  role: string;
  status: string;
  language: "ko" | "en";
};

type CareerQuote = { text: string; attribution?: string; sourceUrl?: string; connection?: string };

const englishSource = "https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)";

const quotes: Record<string, CareerQuote> = {
  setback: { text: "Every cloud has a silver lining.", attribution: "English proverb", sourceUrl: englishSource },
  together: { text: "Many hands make light work.", attribution: "English proverb", sourceUrl: englishSource },
  practice: { text: "Practice makes perfect.", attribution: "English proverb", sourceUrl: englishSource },
  change: { text: "Better late than never.", attribution: "English proverb", sourceUrl: englishSource },
  start: { text: "Well begun is half done.", attribution: "English proverb", sourceUrl: englishSource },
  fallback: { text: "One useful step today can open your next opportunity." },
};

export function selectCareerQuote(input: QuoteInput): CareerQuote {
  const concern = input.concern.toLowerCase();
  const context = `${input.role} ${input.status}`.toLowerCase();
  const category = /불합격|탈락|거절|실패|낙방|rejection|rejected|failed|failure|setback/.test(concern)
    ? "setback"
    : /혼자|인맥|네트워크|협업|멘토|동료|network|team|mentor|connection|collaborat/.test(concern)
      ? "together"
      : /배우|학습|역량|기술|스킬|포트폴리오|경험 부족|learn|skill|portfolio|experience gap/.test(concern)
        ? "practice"
        : /이직|전환|새 직무|커리어 변경|switch|change career|transition|pivot/.test(concern)
          ? "change"
          : /이직|전환|경력직|switch|career change|transition/.test(context) || input.age >= 40
            ? "change"
            : /신입|취준|졸업|구직|graduate|entry|first job/.test(context) || input.age < 30
              ? "start"
              : "fallback";
  const role = input.role;
  const connection = input.language === "en"
    ? category === "setback" ? `Write down one lesson from your last application before trying another ${role} role.`
      : category === "together" ? `Ask one person for feedback on your ${role} path this week.`
        : category === "practice" ? `Turn one ${role} skill into a small, visible project this week.`
          : category === "change" ? `Name one achievement you can carry into your next ${role} role.`
            : `At ${input.age}, one concrete step toward ${role} can make your direction clearer.`
    : category === "setback" ? `지난 지원에서 배운 점 하나를 적고 ${role} 도전을 다시 이어가 보세요.`
      : category === "together" ? `${role} 준비에 도움이 될 피드백을 이번 주 한 사람에게 구해 보세요.`
        : category === "practice" ? `${role} 역량 하나를 이번 주 작은 결과물로 보여 주세요.`
          : category === "change" ? `지금까지의 성과 중 ${role}에 이어질 한 가지를 찾아보세요.`
            : `만 ${input.age}세의 오늘, ${role}을 향한 작은 행동 하나가 방향을 선명하게 합니다.`;
  return { ...quotes[category], connection };
}
