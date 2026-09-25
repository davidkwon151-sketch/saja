import { statusKind, type StatusKind } from "./plan";

export type ResourceCategory =
  | "jobs"
  | "learning"
  | "certificate"
  | "contest"
  | "portfolio"
  | "network"
  | "support"
  | "research";

export type RoleTrack = "dev" | "data" | "design" | "marketing" | "sales" | "global" | "public" | "office";

export type CareerResource = {
  id: string;
  name: string;
  url: string;
  category: ResourceCategory;
  desc: { ko: string; en: string };
  /** 이 상태의 사용자에게 특히 유용하다. 비어 있으면 모든 상태에 공통이다. */
  statuses?: StatusKind[];
  /** 이 직무군에 특히 유용하다. 비어 있으면 직무와 무관한 공통 리소스다. */
  roleKeywords?: RoleTrack[];
  /** 고민 문장에 이 표현이 있으면 우선한다. */
  concernKeywords?: RegExp;
};

/**
 * 2026-09-25 HTTP 요청으로 접속을 확인한 실제 커리어 리소스 목록.
 * 검증 기록: exports/resource-verification-2026-09-25.txt
 * AI는 id만 고를 수 있고 URL은 항상 이 목록에서만 나온다.
 */
export const careerResources: CareerResource[] = [
  // jobs
  { id: "work24-jobs", name: "고용24 채용정보", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", category: "jobs",
    desc: { ko: "고용노동부 공공 채용정보. 지역·경력·고용형태로 공고를 찾을 수 있어요.", en: "Korea's public job board by the Ministry of Employment, filterable by region and experience." } },
  { id: "saramin", name: "사람인", url: "https://www.saramin.co.kr/", category: "jobs",
    desc: { ko: "공고 수가 많은 종합 채용 사이트. 직무 키워드 알림을 걸어두기 좋아요.", en: "A large general job board; set keyword alerts for your role." } },
  { id: "jobkorea", name: "잡코리아", url: "https://www.jobkorea.co.kr/", category: "jobs",
    desc: { ko: "대기업·중견기업 공고와 합격 자소서 자료가 많은 종합 채용 사이트예요.", en: "A general job board with many large-company postings and cover-letter examples." } },
  { id: "wanted", name: "원티드", url: "https://www.wanted.co.kr/", category: "jobs",
    desc: { ko: "스타트업·IT 기업 중심 채용 플랫폼. 직무별 연봉 정보와 이력서 도구가 있어요.", en: "A startup and tech job platform with salary insights and resume tools." },
    roleKeywords: ["dev", "data", "design", "marketing"] },
  { id: "remember", name: "리멤버 커리어", url: "https://career.rememberapp.co.kr/", category: "jobs",
    desc: { ko: "경력직 스카우트·헤드헌팅 제안을 받을 수 있는 경력직 채용 플랫폼이에요.", en: "An experienced-hire platform where recruiters and headhunters reach out to you." },
    statuses: ["employed"] },
  { id: "linkedin-jobs", name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs/", category: "jobs",
    desc: { ko: "외국계·글로벌 포지션을 찾고 채용 담당자와 직접 연결되기 좋아요.", en: "Find global roles and connect directly with recruiters." },
    roleKeywords: ["global", "sales", "dev", "data"] },
  { id: "jumpit", name: "점핏", url: "https://jumpit.saramin.co.kr/", category: "jobs",
    desc: { ko: "기술 스택으로 공고를 찾는 개발자 전용 채용 서비스예요.", en: "A developer job board you can search by tech stack." },
    roleKeywords: ["dev", "data"] },
  { id: "jasoseol", name: "자소설닷컴", url: "https://jasoseol.com/", category: "jobs",
    desc: { ko: "대기업·공기업 신입 공채 일정과 자기소개서 문항을 한눈에 볼 수 있어요.", en: "Entry-level recruitment calendars and essay questions for large and public companies." },
    statuses: ["preparing"] },
  { id: "peoplenjob", name: "피플앤잡", url: "https://www.peoplenjob.com/", category: "jobs",
    desc: { ko: "외국계 기업 채용 전문 사이트. 영문 이력서가 필요한 포지션이 많아요.", en: "Job board specializing in foreign companies in Korea." },
    roleKeywords: ["global", "sales", "office", "marketing"] },
  { id: "worldjob", name: "월드잡플러스", url: "https://www.worldjob.or.kr/", category: "jobs",
    desc: { ko: "정부(한국산업인력공단)가 운영하는 해외취업·해외인턴 정보 포털이에요.", en: "Government portal for overseas jobs and internships." },
    roleKeywords: ["global"], concernKeywords: /해외|글로벌|외국|overseas|abroad|global/i },
  { id: "gojobs", name: "나라일터", url: "https://www.gojobs.go.kr/", category: "jobs",
    desc: { ko: "인사혁신처가 운영하는 공무원·공공부문 채용정보 공식 사이트예요.", en: "Official government portal for civil-service and public-sector jobs." },
    roleKeywords: ["public"], concernKeywords: /공무원|공공|공기업|civil service|public sector/i },
  { id: "job-alio", name: "잡알리오 (공공기관 채용정보)", url: "https://job.alio.go.kr/", category: "jobs",
    desc: { ko: "공공기관 채용공고와 NCS 기반 채용 정보를 모아 보는 공식 시스템이에요.", en: "Official listing of public-institution jobs in Korea." },
    roleKeywords: ["public"], concernKeywords: /공기업|공공기관|NCS|public/i },

  // support
  { id: "work24-programs", name: "고용24 취업지원 프로그램 (국민취업지원제도 등)", url: "https://www.work24.go.kr/cm/f/e/0100/empPrgSrchMain.do", category: "support",
    desc: { ko: "국민취업지원제도·취업역량 강화 프로그램 등 공공 취업지원을 한곳에서 찾을 수 있어요.", en: "Search public job-support programs, including Korea's National Employment Support Program." },
    statuses: ["preparing", "returning"], concernKeywords: /지원금|생활비|수당|상담|막막|support|allowance/i },
  { id: "work24-training", name: "국민내일배움카드 훈련과정", url: "https://www.work24.go.kr/hr/a/a/1100/trnnCrsInf.do", category: "support",
    desc: { ko: "내일배움카드로 수강료를 지원받을 수 있는 직업훈련 과정을 검색해요.", en: "Find vocational training courses subsidized by Korea's Tomorrow Learning Card." },
    statuses: ["preparing", "returning", "employed"], concernKeywords: /교육|훈련|국비|부트캠프|배우|training|bootcamp|course/i },
  { id: "saeil", name: "여성새로일하기센터", url: "https://saeil.mogef.go.kr/", category: "support",
    desc: { ko: "경력단절 여성을 위한 취업상담·직업훈련·인턴십을 지원하는 공공 기관이에요.", en: "Public centers supporting women returning to work with counseling, training, and internships." },
    statuses: ["returning"], concernKeywords: /경력\s*단절|경단|육아|출산|공백|career break|parental/i },
  { id: "youthcenter", name: "온통청년", url: "https://www.youthcenter.go.kr/", category: "support",
    desc: { ko: "청년 일자리·주거·교육 정책과 지원사업을 모아 둔 정부 포털이에요.", en: "Government portal for youth employment and support policies." },
    statuses: ["preparing"], concernKeywords: /청년|youth/i },
  { id: "seoul-50plus", name: "서울시50플러스 일자리몽땅", url: "https://www.50plus.or.kr/", category: "support",
    desc: { ko: "서울 거주 중장년의 재취업·교육·경력 전환을 지원해요.", en: "Re-employment and training support for middle-aged residents of Seoul." },
    statuses: ["returning"], concernKeywords: /중장년|50대|40대|은퇴|퇴직|middle-aged|retire/i },

  // learning
  { id: "kmooc", name: "K-MOOC", url: "https://www.kmooc.kr/", category: "learning",
    desc: { ko: "국내 대학 강의를 무료로 듣고 이수증을 받을 수 있는 공공 온라인 강좌예요.", en: "Free online university courses from Korean universities with completion certificates." } },
  { id: "inflearn", name: "인프런", url: "https://www.inflearn.com/", category: "learning",
    desc: { ko: "개발·데이터·디자인·마케팅 실무 강의가 많은 온라인 학습 플랫폼이에요.", en: "Practical courses in development, data, design, and marketing." },
    roleKeywords: ["dev", "data", "design", "marketing"] },
  { id: "programmers-school", name: "프로그래머스 스쿨", url: "https://school.programmers.co.kr/", category: "learning",
    desc: { ko: "코딩테스트 연습 문제와 SQL 문제로 실력을 확인하고 기를 수 있어요.", en: "Coding-test and SQL practice problems to build and prove your skills." },
    roleKeywords: ["dev", "data"], concernKeywords: /코딩\s*테스트|코테|알고리즘|SQL|coding test/i },
  { id: "boostcourse", name: "부스트코스", url: "https://www.boostcourse.org/", category: "learning",
    desc: { ko: "네이버 커넥트재단의 무료 IT·데이터 강좌와 프로젝트형 코스예요.", en: "Free IT and data courses from the NAVER Connect Foundation." },
    roleKeywords: ["dev", "data", "design"] },
  { id: "coursera", name: "Coursera", url: "https://www.coursera.org/career-academy", category: "learning",
    desc: { ko: "직무별 전문 자격 과정(Google·IBM 등)으로 영문 이수증을 준비할 수 있어요.", en: "Role-based professional certificates from Google, IBM, and others." },
    roleKeywords: ["data", "dev", "marketing", "global"] },
  { id: "step", name: "STEP 국민평생직업능력개발", url: "https://www.step.or.kr/", category: "learning",
    desc: { ko: "한국기술교육대학교가 운영하는 공공 직업훈련 온라인 학습 플랫폼이에요.", en: "A public online vocational training platform run by KOREATECH." },
    statuses: ["returning", "employed"] },
  { id: "google-skillshop", name: "Google Skillshop", url: "https://skillshop.withgoogle.com/", category: "learning",
    desc: { ko: "Google Ads·Analytics 무료 교육과 인증으로 마케팅 역량을 증명할 수 있어요.", en: "Free Google Ads and Analytics training and certifications." },
    roleKeywords: ["marketing"] },

  // certificate
  { id: "qnet", name: "Q-Net 큐넷", url: "https://www.q-net.or.kr/", category: "certificate",
    desc: { ko: "국가기술자격 시험 일정 확인과 원서 접수를 하는 공식 사이트예요.", en: "Official site for Korean national technical qualification exams." },
    roleKeywords: ["dev", "office", "public"], concernKeywords: /자격증|기사|산업기사|certificate|license/i },
  { id: "dataq", name: "데이터자격검정", url: "https://www.dataq.or.kr/", category: "certificate",
    desc: { ko: "ADsP·SQLD·빅데이터분석기사 등 데이터 자격시험 공식 사이트예요.", en: "Official site for data certifications such as ADsP and SQLD." },
    roleKeywords: ["data"], concernKeywords: /ADsP|SQL|빅데이터|자격증|certificate/i },
  { id: "korcham-license", name: "대한상공회의소 자격평가사업단", url: "https://license.korcham.net/", category: "certificate",
    desc: { ko: "컴퓨터활용능력·전산회계 등 사무 직무에 자주 요구되는 자격시험을 접수해요.", en: "Office-skill certifications such as Computer Proficiency and accounting exams." },
    roleKeywords: ["office", "public"], concernKeywords: /컴활|컴퓨터활용|회계|사무|자격증/i },
  { id: "toeic", name: "TOEIC 공식 사이트", url: "https://exam.toeic.co.kr/", category: "certificate",
    desc: { ko: "지원 자격에 자주 쓰이는 영어 점수 시험 일정과 접수 정보를 확인해요.", en: "Schedules and registration for the TOEIC English test." },
    roleKeywords: ["global", "sales", "public"], concernKeywords: /토익|영어|어학|TOEIC|English/i },
  { id: "opic", name: "OPIc", url: "https://www.opic.or.kr/", category: "certificate",
    desc: { ko: "말하기 중심 외국어 평가로, 해외영업·글로벌 직무 지원에 자주 쓰여요.", en: "A speaking-focused language test often required for global roles." },
    roleKeywords: ["global", "sales"], concernKeywords: /오픽|OPIc|말하기|회화|speaking/i },

  // contest
  { id: "linkareer", name: "링커리어", url: "https://linkareer.com/", category: "contest",
    desc: { ko: "대외활동·공모전·인턴 공고와 합격 자소서를 모아 볼 수 있어요.", en: "Extracurriculars, contests, internships, and application examples." },
    statuses: ["preparing"], concernKeywords: /대외활동|공모전|인턴|경험\s*부족|스펙|internship|contest/i },
  { id: "thinkgood", name: "씽굿", url: "https://www.thinkcontest.com/", category: "contest",
    desc: { ko: "분야별 공모전 정보를 모아 보는 공모전 전문 사이트예요.", en: "A contest listings site organized by field." },
    statuses: ["preparing"], roleKeywords: ["design", "marketing"], concernKeywords: /공모전|contest/i },
  { id: "campuspick", name: "캠퍼스픽 (에브리커리어)", url: "https://www.campuspick.com/", category: "contest",
    desc: { ko: "대학생 대상 대외활동·공모전·교육 정보를 볼 수 있어요.", en: "Extracurriculars, contests, and programs for university students." },
    statuses: ["preparing"] },
  { id: "wevity", name: "위비티", url: "https://www.wevity.com/", category: "contest",
    desc: { ko: "기획·디자인·영상 등 분야별 공모전을 마감일 순으로 찾을 수 있어요.", en: "Contest listings by field and deadline, from planning to design and video." },
    roleKeywords: ["design", "marketing"], concernKeywords: /공모전|contest/i },
  { id: "dacon", name: "데이콘", url: "https://dacon.io/competitions", category: "contest",
    desc: { ko: "국내 AI·데이터 경진대회 플랫폼. 대회 결과를 포트폴리오로 쓰기 좋아요.", en: "Korean AI and data competitions you can turn into portfolio evidence." },
    roleKeywords: ["data", "dev"], concernKeywords: /데이터톤|경진대회|해커톤|competition|hackathon/i },
  { id: "kaggle", name: "Kaggle", url: "https://www.kaggle.com/", category: "contest",
    desc: { ko: "글로벌 데이터 경진대회와 공개 데이터·노트북으로 분석 실력을 보여줄 수 있어요.", en: "Global data competitions, datasets, and notebooks to showcase analysis skills." },
    roleKeywords: ["data"] },

  // portfolio
  { id: "github", name: "GitHub", url: "https://github.com/", category: "portfolio",
    desc: { ko: "코드와 README로 프로젝트 과정을 보여주는 개발·데이터 포트폴리오의 기본이에요.", en: "The default portfolio for code and project READMEs." },
    roleKeywords: ["dev", "data"], concernKeywords: /포트폴리오|프로젝트|portfolio|project/i },
  { id: "notion-portfolio", name: "Notion 포트폴리오 템플릿", url: "https://www.notion.com/templates/category/portfolio", category: "portfolio",
    desc: { ko: "직무와 상관없이 문제·과정·결과를 한 페이지 포트폴리오로 정리할 수 있어요.", en: "Portfolio templates to present problem, process, and results on one page." },
    concernKeywords: /포트폴리오|경력기술서|정리|portfolio/i },
  { id: "behance", name: "Behance", url: "https://www.behance.net/", category: "portfolio",
    desc: { ko: "디자인·브랜딩 작업을 공개하고 다른 디자이너의 포트폴리오를 참고할 수 있어요.", en: "Showcase design and branding work and study other portfolios." },
    roleKeywords: ["design"] },
  { id: "data-go-kr", name: "공공데이터포털", url: "https://www.data.go.kr/", category: "portfolio",
    desc: { ko: "공공 데이터를 내려받아 실제 문제를 푸는 분석 프로젝트를 만들 수 있어요.", en: "Download Korean public datasets to build a real analysis project." },
    roleKeywords: ["data", "dev", "public"] },

  // network
  { id: "linkedin", name: "LinkedIn", url: "https://www.linkedin.com/", category: "network",
    desc: { ko: "프로필을 목표 직무 언어로 정리하고 현직자에게 커피챗을 요청해 보세요.", en: "Update your profile in target-role language and request informational chats." },
    roleKeywords: ["global", "sales", "dev", "data", "marketing"], concernKeywords: /인맥|네트워크|멘토|현직자|network|mentor/i },
  { id: "careerly", name: "커리어리", url: "https://careerly.co.kr/", category: "network",
    desc: { ko: "현직자들이 직무 인사이트를 공유하는 커리어 커뮤니티예요.", en: "A Korean career community where practitioners share insights." },
    roleKeywords: ["dev", "data", "design", "marketing"], concernKeywords: /인맥|네트워크|현직자|커뮤니티|network|community/i },

  // research
  { id: "careernet", name: "커리어넷", url: "https://www.career.go.kr/", category: "research",
    desc: { ko: "교육부 진로정보망. 직업정보와 진로 적성 검사를 무료로 볼 수 있어요.", en: "The Ministry of Education's career portal with job information and aptitude tests." },
    statuses: ["preparing"], concernKeywords: /적성|방향|진로|모르겠|aptitude|direction/i },
  { id: "work24-aptitude", name: "고용24 직업심리검사", url: "https://www.work24.go.kr/wk/r/c/1000/jobPsyExamList.do", category: "research",
    desc: { ko: "직업선호도·적성 검사를 무료로 받고 결과 상담으로 이어갈 수 있어요.", en: "Free vocational interest and aptitude tests from Korea's public employment service." },
    concernKeywords: /적성|흥미|방향|모르겠|맞는 직무|aptitude|fit|direction/i },
  { id: "jobplanet", name: "잡플래닛", url: "https://www.jobplanet.co.kr/", category: "research",
    desc: { ko: "재직자 리뷰·연봉·면접 후기로 지원할 회사를 미리 조사할 수 있어요.", en: "Company reviews, salaries, and interview experiences from employees." },
    statuses: ["employed", "returning"], concernKeywords: /회사|연봉|기업|면접|company|salary|interview/i },
  { id: "dart", name: "DART 전자공시시스템", url: "https://dart.fss.or.kr/", category: "research",
    desc: { ko: "지원 기업의 사업보고서로 매출·사업 구조를 확인해 면접 답변 근거를 만들 수 있어요.", en: "Read company filings to understand business and financials before interviews." },
    roleKeywords: ["sales", "global", "office", "marketing"], concernKeywords: /기업 분석|회사 분석|면접|company research/i },
];

export const resourceIds = new Set(careerResources.map((resource) => resource.id));

const trackPatterns: Array<[RoleTrack, RegExp]> = [
  ["dev", /개발|엔지니어|프론트|백엔드|풀스택|프로그래머|서버|앱|웹|devops|developer|engineer|software|frontend|backend|programmer|\bqa\b/i],
  ["data", /데이터|분석|\bAI\b|인공지능|머신러닝|딥러닝|통계|data|analyst|analytics|machine learning|\bml\b|scientist/i],
  ["design", /디자인|디자이너|UX|UI|그래픽|영상|design|designer|graphic|video/i],
  ["marketing", /마케팅|마케터|브랜드|콘텐츠|광고|홍보|퍼포먼스|\bPR\b|marketing|marketer|brand|content|advertis|growth/i],
  ["sales", /영업|세일즈|사업개발|\bBD\b|어카운트|sales|business development|account manager/i],
  ["global", /해외|글로벌|무역|수출|통번역|외국계|overseas|global|international|export|trade|foreign/i],
  ["public", /공무원|공공|공기업|공단|행정|public|government|civil/i],
  ["office", /사무|회계|인사|총무|경영지원|재무|\bHR\b|노무|accounting|admin|finance|human resources|office/i],
];

export function roleTracks(role: string): RoleTrack[] {
  return trackPatterns.filter(([, pattern]) => pattern.test(role)).map(([track]) => track);
}

const concernCategoryPatterns: Array<[ResourceCategory, RegExp]> = [
  ["certificate", /자격증|자격|어학|토익|certificate|license|certification/i],
  ["portfolio", /포트폴리오|프로젝트|결과물|경력기술서|portfolio|project/i],
  ["contest", /공모전|대외활동|해커톤|데이터톤|경진대회|contest|hackathon|competition/i],
  ["network", /인맥|네트워크|멘토|현직자|혼자|network|mentor|alone/i],
  ["learning", /교육|배우|공부|학습|강의|역량 부족|실력|learn|study|course|skill/i],
  ["support", /공백|경력\s*단절|지원금|생활비|막막|불안|gap|career break|support/i],
  ["research", /연봉|회사|기업|적성|방향|모르겠|salary|company|direction|aptitude/i],
];

export type SelectedResource = {
  id: string;
  name: string;
  url: string;
  category: ResourceCategory;
  reason: string;
  source: "ai" | "match";
};

export type ResourceInput = {
  role: string;
  status: string;
  concern: string;
  language: "ko" | "en";
};

function scoreResource(resource: CareerResource, tracks: RoleTrack[], status: StatusKind, concern: string, concernCategories: Set<ResourceCategory>) {
  let score = 0;
  if (resource.roleKeywords?.some((track) => tracks.includes(track))) score += 3;
  if (resource.statuses?.includes(status)) score += 2;
  if (resource.concernKeywords?.test(concern)) score += 3;
  if (concernCategories.has(resource.category)) score += 1;
  // 직무·상태 제한이 없는 공통 리소스는 약한 기본 점수만 가진다.
  if (!resource.roleKeywords && !resource.statuses) score += 0.5;
  // 특정 직무 전용 리소스가 다른 직무 사용자에게 나오지 않게 한다.
  if (resource.roleKeywords && !resource.roleKeywords.some((track) => tracks.includes(track)) && !resource.concernKeywords?.test(concern)) score -= 2;
  return score;
}

/** 입력과 가장 관련 있는 리소스를 점수순으로 반환한다. 네트워크 요청을 하지 않는다. */
export function rankResources(input: ResourceInput): CareerResource[] {
  const tracks = roleTracks(input.role);
  const status = statusKind(input.status);
  const concernText = `${input.concern} ${input.role}`;
  const concernCategories = new Set(
    concernCategoryPatterns.filter(([, pattern]) => pattern.test(input.concern)).map(([category]) => category),
  );
  return careerResources
    .map((resource, index) => ({ resource, index, score: scoreResource(resource, tracks, status, concernText, concernCategories) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ resource }) => resource);
}

const categoryOrder: ResourceCategory[] = ["jobs", "support", "learning", "certificate", "contest", "portfolio", "network", "research"];

/**
 * AI가 고른 id(카탈로그에 있는 것만)와 결정적 매칭 결과를 합쳐 4~8개를 고른다.
 * URL은 항상 카탈로그에서만 가져온다.
 */
export function selectResources(
  input: ResourceInput,
  aiPicks: Array<{ id: string; reason?: string }> = [],
): SelectedResource[] {
  const byId = new Map(careerResources.map((resource) => [resource.id, resource]));
  const chosen = new Map<string, SelectedResource>();
  const perCategory = new Map<ResourceCategory, number>();
  const add = (resource: CareerResource, reason: string | undefined, source: "ai" | "match", categoryLimit: number) => {
    if (chosen.has(resource.id)) return;
    const count = perCategory.get(resource.category) || 0;
    if (count >= categoryLimit) return;
    perCategory.set(resource.category, count + 1);
    chosen.set(resource.id, {
      id: resource.id,
      name: resource.name,
      url: resource.url,
      category: resource.category,
      reason: reason || resource.desc[input.language],
      source,
    });
  };

  for (const pick of aiPicks.slice(0, 5)) {
    const resource = byId.get(pick.id);
    if (resource) add(resource, pick.reason, "ai", 3);
  }
  const ranked = rankResources(input);
  const target = Math.min(8, Math.max(6, chosen.size + 2));
  if (![...chosen.values()].some((item) => item.category === "jobs")) {
    const job = ranked.find((resource) => resource.category === "jobs");
    if (job) add(job, undefined, "match", 2);
  }
  for (const resource of ranked) {
    if (chosen.size >= target) break;
    add(resource, undefined, "match", 2);
  }
  return [...chosen.values()].sort(
    (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
  );
}

export type SearchLink = { id: string; site: string; url: string };

/** 희망 직무를 검색어로 넣은 채용 사이트 검색 링크. 공고를 만들어내지 않고 검색 결과 페이지로만 연결한다. */
export function jobSearchLinks(role: string, language: "ko" | "en"): SearchLink[] {
  const keyword = role.replace(/\s+/g, " ").trim().slice(0, 40);
  if (!keyword) return [];
  const q = encodeURIComponent(keyword);
  const links: SearchLink[] = [
    { id: "search-saramin", site: language === "en" ? "Saramin" : "사람인", url: `https://www.saramin.co.kr/zf_user/search?searchword=${q}` },
    { id: "search-wanted", site: language === "en" ? "Wanted" : "원티드", url: `https://www.wanted.co.kr/search?query=${q}&tab=position` },
  ];
  const global = language === "en" || roleTracks(role).includes("global") || /^[\x20-\x7E]+$/.test(keyword);
  links.push(global
    ? { id: "search-linkedin", site: "LinkedIn", url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=South%20Korea` }
    : { id: "search-jobkorea", site: "잡코리아", url: `https://www.jobkorea.co.kr/Search/?stext=${q}` });
  return links;
}
