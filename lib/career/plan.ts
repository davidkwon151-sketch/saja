export type CareerInput = {
  concern: string;
  birthDate: string;
  targetDate: string;
  role: string;
  status: string;
};

export type PlanStep = { title: string; period: string; actions: string[] };

export function todayInKorea() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function validateCareerInput(value: unknown, today = todayInKorea()): CareerInput {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("입력 내용을 확인해주세요.");
  const raw = value as Record<string, unknown>;
  for (const [key, label, max] of [
    ["concern", "고민", 500],
    ["role", "희망 직무", 80],
    ["status", "현재 상태", 80],
  ] as const) {
    if (typeof raw[key] !== "string" || !raw[key].trim())
      throw new Error(`${label}을(를) 입력해주세요.`);
    if (raw[key].trim().length > max)
      throw new Error(`${label}은(는) ${max}자까지 입력할 수 있어요.`);
  }
  for (const [key, label] of [
    ["birthDate", "생년월일"],
    ["targetDate", "입사 목표일"],
  ] as const) {
    const date = raw[key];
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new Error(`${label}을(를) 입력해주세요.`);
    const parsed = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date)
      throw new Error(`${label}을(를) 다시 확인해주세요.`);
  }
  if ((raw.birthDate as string) > today) throw new Error("생년월일은 오늘 이전이어야 합니다.");
  if ((raw.targetDate as string) <= today) throw new Error("입사 목표일은 내일 이후로 정해주세요.");
  return {
    concern: (raw.concern as string).trim(),
    birthDate: raw.birthDate as string,
    targetDate: raw.targetDate as string,
    role: (raw.role as string).trim(),
    status: (raw.status as string).trim(),
  };
}

export function basePlan(input: CareerInput, today = todayInKorea(), language: "ko" | "en" = "ko"): PlanStep[] {
  const start = new Date(`${today}T00:00:00Z`).getTime();
  const end = new Date(`${input.targetDate}T00:00:00Z`).getTime();
  const dateAt = (fraction: number) =>
    new Date(start + (end - start) * fraction).toISOString().slice(0, 10);
  if (language === "en") return [
    {
      title: "Choose your direction",
      period: `${today} ~ ${dateAt(1 / 3)}`,
      actions: [
        `Review five ${input.role} job descriptions and note three common requirements.`,
        "Compare those requirements with your experience and choose one skill to build first.",
      ],
    },
    {
      title: "Turn experience into evidence",
      period: `${dateAt(1 / 3)} ~ ${dateAt(2 / 3)}`,
      actions: [
        "Complete one relevant project, course, internship, or challenge and record what you made.",
        "Summarize your role, results, and lessons in your resume or portfolio.",
      ],
    },
    {
      title: "Apply and prepare for interviews",
      period: `${dateAt(2 / 3)} ~ ${input.targetDate}`,
      actions: [
        "Check eligibility and deadlines on the original job posting, then tailor and send your application.",
        "Track applications and practice answers to five likely interview questions out loud.",
      ],
    },
  ];
  const evidenceAction = input.concern.includes("포트폴리오")
    ? `${input.role} 관련 포트폴리오 결과물 하나를 완성하고, 문제·방법·성과를 한 페이지로 정리하세요.`
    : input.status.includes("재직")
      ? "현재 업무에서 희망 직무와 연결되는 성과 한 가지를 골라 수치와 함께 사례로 정리하세요."
      : "교육·인턴·프로젝트·공모전·해커톤·데이터톤 중 하나에 참여해 보여줄 결과물을 만드세요.";
  return [
    {
      title: "방향과 지원 기준 정하기",
      period: `${today} ~ ${dateAt(1 / 3)}`,
      actions: [
        `${input.role} 채용공고 5개를 읽고 공통 자격요건 3가지를 적어보세요.`,
        `${input.status}인 현재 경험과 자격요건을 비교해 먼저 채울 역량 한 가지를 고르세요.`,
      ],
    },
    {
      title: "경험을 증거로 만들기",
      period: `${dateAt(1 / 3)} ~ ${dateAt(2 / 3)}`,
      actions: [
        evidenceAction,
        "이력서에 결과, 맡은 역할, 배운 점을 숫자와 함께 정리하세요.",
      ],
    },
    {
      title: "지원하고 면접 준비하기",
      period: `${dateAt(2 / 3)} ~ ${input.targetDate}`,
      actions: [
        "지원 자격과 마감일을 원문에서 확인한 공고에 맞춰 이력서를 수정해 지원하세요.",
        "지원 내용을 기록하고 면접 질문 5개에 대한 답을 소리 내어 연습하세요.",
      ],
    },
  ];
}
