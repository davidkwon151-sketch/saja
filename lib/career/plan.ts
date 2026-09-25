export type CareerInput = {
  concern: string;
  birthDate: string;
  targetDate: string;
  role: string;
  status: string;
};

export type PlanStep = { title: string; period: string; actions: string[]; milestone?: string };

export type StatusKind = "preparing" | "employed" | "returning" | "other";

/** 화면의 상태 선택값(한국어)과 영어 입력을 모두 해석한다. */
export function statusKind(status: string): StatusKind {
  if (/재취업|복직|경력\s*단절|공백|return|re-?entry|career break/i.test(status)) return "returning";
  if (/재직|이직|employed|working|job change/i.test(status)) return "employed";
  if (/취업\s*준비|취준|구직|신입|졸업|학생|preparing|first job|student|graduate|job seeker/i.test(status)) return "preparing";
  return "other";
}

export type Interview = { question: string; tip: string };
export type Risk = { risk: string; response: string };
export type BasicExtras = { firstWeek: string[]; interview: Interview[]; risks: Risk[] };

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
  const periods = [
    `${today} ~ ${dateAt(1 / 3)}`,
    `${dateAt(1 / 3)} ~ ${dateAt(2 / 3)}`,
    `${dateAt(2 / 3)} ~ ${input.targetDate}`,
  ];
  const kind = statusKind(input.status);
  const role = input.role;
  const portfolioConcern = /포트폴리오|portfolio/i.test(input.concern);

  if (language === "en") {
    const directionExtra = kind === "employed"
      ? "Block two fixed weekly slots (e.g. two evenings) for your move so it does not compete with your current job."
      : kind === "returning"
        ? "List what you did during your career break (care, study, volunteering) and pick one thing that connects to the role."
        : "Compare those requirements with your experience and choose one skill to build first.";
    const evidenceAction = portfolioConcern
      ? `Finish one ${role} portfolio piece and summarize problem, approach, and result on one page.`
      : kind === "employed"
        ? `Pick one achievement from your current job that connects to ${role} and write it up with numbers.`
        : kind === "returning"
          ? `Take one short refresher course or project for ${role} to show your skills are current.`
          : "Complete one relevant project, course, internship, or challenge and record what you made.";
    return [
      {
        title: "Choose your direction",
        period: periods[0],
        actions: [`Review five ${role} job descriptions and note three common requirements.`, directionExtra],
        milestone: "A one-page list of three must-have requirements and your current level for each.",
      },
      {
        title: "Turn experience into evidence",
        period: periods[1],
        actions: [evidenceAction, "Summarize your role, results, and lessons in your resume or portfolio."],
        milestone: "One finished piece of evidence (project, certificate, or case) linked from your resume.",
      },
      {
        title: "Apply and prepare for interviews",
        period: periods[2],
        actions: [
          "Check eligibility and deadlines on the original job posting, then tailor and send your application.",
          "Track applications and practice answers to five likely interview questions out loud.",
        ],
        milestone: "At least ten tailored applications sent and five answers rehearsed out loud.",
      },
    ];
  }

  const directionExtra = kind === "employed"
    ? "퇴근 후 저녁 2회처럼 이직 준비 시간을 주간 일정에 고정해 현재 업무와 부딪히지 않게 하세요."
    : kind === "returning"
      ? "공백 기간에 한 일(돌봄·학습·봉사 등)을 적고 희망 직무와 이어지는 경험 한 가지를 고르세요."
      : `${input.status}인 현재 경험과 자격요건을 비교해 먼저 채울 역량 한 가지를 고르세요.`;
  const evidenceAction = portfolioConcern
    ? `${role} 관련 포트폴리오 결과물 하나를 완성하고, 문제·방법·성과를 한 페이지로 정리하세요.`
    : kind === "employed"
      ? "현재 업무에서 희망 직무와 연결되는 성과 한 가지를 골라 수치와 함께 사례로 정리하세요."
      : kind === "returning"
        ? `${role} 관련 짧은 재교육 과정이나 작은 프로젝트 하나로 최근 역량을 보여줄 결과물을 만드세요.`
        : "교육·인턴·프로젝트·공모전·해커톤·데이터톤 중 하나에 참여해 보여줄 결과물을 만드세요.";
  return [
    {
      title: "방향과 지원 기준 정하기",
      period: periods[0],
      actions: [`${role} 채용공고 5개를 읽고 공통 자격요건 3가지를 적어보세요.`, directionExtra],
      milestone: "필수 자격요건 3가지와 각각의 내 수준을 한 페이지로 정리한 상태",
    },
    {
      title: "경험을 증거로 만들기",
      period: periods[1],
      actions: [evidenceAction, "이력서에 결과, 맡은 역할, 배운 점을 숫자와 함께 정리하세요."],
      milestone: "이력서에 연결할 수 있는 결과물(프로젝트·자격증·사례) 1개 완성",
    },
    {
      title: "지원하고 면접 준비하기",
      period: periods[2],
      actions: [
        "지원 자격과 마감일을 원문에서 확인한 공고에 맞춰 이력서를 수정해 지원하세요.",
        "지원 내용을 기록하고 면접 질문 5개에 대한 답을 소리 내어 연습하세요.",
      ],
      milestone: "맞춤 지원서 10곳 제출, 예상 질문 5개 답변을 소리 내어 연습 완료",
    },
  ];
}

/** AI를 쓰지 못했거나 AI가 해당 부분을 주지 않았을 때 쓰는 상태별 기본 제안. 화면에서 기본 제안으로 표시한다. */
export function baseExtras(input: CareerInput, language: "ko" | "en" = "ko"): BasicExtras {
  const kind = statusKind(input.status);
  const role = input.role;
  if (language === "en") {
    const firstWeek = [
      `Save five ${role} job postings and highlight the repeated requirements.`,
      "Write down three experiences that match those requirements, with one result each.",
      kind === "employed"
        ? "Put two fixed 1-hour job-search slots in your calendar for this week."
        : kind === "returning"
          ? "Write a two-sentence explanation of your career break and what you did during it."
          : "Sign up for one course, contest, or project that fits the role.",
      "Update your resume headline and summary to use the role's wording.",
    ];
    const risks = kind === "employed"
      ? [
        { risk: "Job search time keeps losing to your current workload.", response: "Fix two weekly slots and keep a small backlog so each session starts immediately." },
        { risk: "Your current employer finds out too early.", response: "Use personal devices and email, set profiles to private for your company, and do not resign before a signed offer." },
      ]
      : kind === "returning"
        ? [
          { risk: "Interviewers ask about the gap in your career.", response: "Explain the reason in one sentence, then show what you kept up (courses, projects) and why you are ready now." },
          { risk: "Your skills feel out of date.", response: "Take one short refresher course and finish a small project you can show." },
        ]
        : [
          { risk: "You have little direct work experience.", response: "Turn projects, classes, and part-time work into evidence with your role and a result." },
          { risk: "You apply widely and get no responses.", response: "Tailor fewer applications to the posting's wording and track which versions get replies." },
        ];
    return {
      firstWeek,
      interview: [
        { question: `Why do you want to work as a ${role}?`, tip: "Connect one real experience to what the role does day to day." },
        { question: "Tell us about a problem you solved.", tip: "Use situation, action, and result; state your own part clearly." },
        kind === "returning"
          ? { question: "What did you do during your career break?", tip: "Be brief and honest, then move to how you are ready now." }
          : kind === "employed"
            ? { question: "Why are you leaving your current job?", tip: "Talk about what you want to grow into, not complaints." }
            : { question: "What have you done to prepare for this role?", tip: "Name one concrete course, project, or result." },
      ],
      risks,
    };
  }
  const firstWeek = [
    `${role} 채용공고 5개를 저장하고 반복되는 자격요건에 표시하기`,
    "자격요건과 맞는 내 경험 3가지를 결과 한 줄씩과 함께 적기",
    kind === "employed"
      ? "이번 주 달력에 이직 준비 시간 1시간짜리 2칸 고정하기"
      : kind === "returning"
        ? "공백 기간을 설명하는 두 문장(이유 + 그동안 한 일) 써 보기"
        : "직무에 맞는 교육·공모전·프로젝트 중 1개 신청하기",
    "이력서 첫 줄 소개와 요약을 목표 직무 표현으로 고쳐 쓰기",
  ];
  const risks = kind === "employed"
    ? [
      { risk: "현재 업무에 밀려 이직 준비 시간이 계속 줄어들 수 있어요.", response: "주 2회 고정 시간을 정하고, 바로 시작할 작은 할 일 목록을 미리 만들어 두세요." },
      { risk: "재직 중인 회사에 준비 사실이 먼저 알려질 수 있어요.", response: "개인 기기·메일을 쓰고 채용 플랫폼에서 현 회사 열람을 차단하세요. 최종 합격과 입사일 확정 전에는 퇴사 의사를 밝히지 마세요." },
    ]
    : kind === "returning"
      ? [
        { risk: "면접에서 공백 기간 질문을 받을 수 있어요.", response: "이유를 한 문장으로 짧게 말하고, 그동안 유지한 학습·활동과 지금 바로 일할 수 있는 준비 상태로 이어가세요." },
        { risk: "최근 실무 감각이 부족하다고 느낄 수 있어요.", response: "짧은 재교육 과정 하나와 작은 결과물 하나로 최근 역량을 보여주세요." },
      ]
      : [
        { risk: "직무 경험이 부족해 서류에서 탈락할 수 있어요.", response: "수업·프로젝트·아르바이트 경험을 맡은 역할과 결과 중심으로 바꿔 쓰세요." },
        { risk: "많이 지원해도 연락이 없으면 지칠 수 있어요.", response: "지원 수를 줄이고 공고 표현에 맞춰 수정한 뒤, 어떤 버전이 응답을 받는지 기록하세요." },
      ];
  return {
    firstWeek,
    interview: [
      { question: `왜 ${role} 직무에 지원했나요?`, tip: "실제 경험 한 가지를 직무의 일상 업무와 연결해 말하세요." },
      { question: "문제를 해결했던 경험을 말해 주세요.", tip: "상황·행동·결과 순서로, 내가 맡은 부분을 분명히 말하세요." },
      kind === "returning"
        ? { question: "공백 기간에는 무엇을 하셨나요?", tip: "짧고 솔직하게 답한 뒤 지금 준비된 점으로 넘어가세요." }
        : kind === "employed"
          ? { question: "현재 회사를 떠나려는 이유는 무엇인가요?", tip: "불만보다 앞으로 키우고 싶은 역량과 방향을 말하세요." }
          : { question: "이 직무를 위해 무엇을 준비했나요?", tip: "교육·프로젝트·결과 중 구체적인 한 가지를 말하세요." },
    ],
    risks,
  };
}

