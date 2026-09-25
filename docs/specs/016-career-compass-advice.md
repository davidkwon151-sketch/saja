# 016 · 커리어 나침반 실무 조언과 외부 리소스 연결

## 목적

해석과 3단계 계획에 그치던 결과를 실제로 움직일 수 있는 커리어 설계 도구로 바꾼다. 진짜 병목과 역량 갭을 짚고, 이번 주 할 일·이력서 문장·면접 질문·상황별 리스크를 제안하며, 직접 확인한 실제 사이트로 연결한다.

## Gemini가 만드는 결과 (JSON)

- 필수: `reading{summary, strengths 1~3, cautions 1~3, reflection}`, `steps` 3개(`title`, `actions` 1~3, 선택 `milestone` 완료 기준). 기간은 서버가 정한다.
- 선택(각각 따로 검사, 잘못되면 그 부분만 버림):
  - `diagnosis{coreIssue, gaps[1~4]{skill, level: have|partial|missing, evidence}}`
  - `firstWeek[2~5]` 7일 안에, 1시간 이내, 동사로 시작
  - `resumeLines[1~3]` 수치를 지어내지 않고 `[N]%` 빈칸 사용
  - `interview[1~3]{question, tip}`, `risks[1~2]{risk, response}` (재취업→공백기, 재직 중→시간·비밀유지·퇴사 타이밍, 취준→경험 부족)
  - `resources[≤5]{id, reason}` — 프롬프트로 준 후보 id 중에서만. 모델은 URL을 쓰지 않는다.
- 기존 규칙 유지: 한자·명리 용어 금지, 실제 공고·링크 생성 금지, 합격 예측 금지, 생년월일 경향은 참고만.

## 실패 조건과 재시도

- `responseSchema`(OBJECT/ARRAY/STRING)로 구조화 출력 요청. 4xx면 스키마 없이 1회 재요청. 형식 검사 실패면 남은 시간이 12초 이상일 때 1회 재요청. 시도당 최대 40초, 전체 55초, 라우트 `maxDuration = 60`.
- 필수 부분이 없거나 3단계가 안 되면 AI 실패 → `planSource: "basic"`, `reading: null`, 상태별 기본 계획. AI 결과로 꾸미지 않는다.
- AI가 빠뜨린 `firstWeek`·`interview`·`risks`는 상태별 기본 제안으로 채우고 `basicSections`에 이름을 넣어 화면에 "기본 제안"으로 표시한다. `diagnosis`·`resumeLines`는 AI 전용이며 없으면 섹션을 숨긴다.
- 모든 텍스트의 URL·도메인은 지운다. 리소스 이유에 링크가 있으면 이유를 버리고 카탈로그 설명을 쓴다. 목록에 없는 id는 무시한다.

## 외부 리소스

- `lib/career/resources.ts`: 실제 사이트 45개(채용·공공지원·학습·자격·공모전·포트폴리오·네트워크·조사). 모든 URL을 2026-09-25 HTTP 요청으로 확인했고 기록은 `exports/resource-verification-2026-09-25.txt`.
- 직무군(개발·데이터·디자인·마케팅·영업·해외·공공·사무), 상태, 고민 키워드로 점수를 매겨 4~8개를 분류별로 고른다. AI가 고른 id를 먼저 넣고 이유를 붙인다. 네트워크 요청은 하지 않는다.
- 희망 직무를 넣은 채용 검색 링크 3개(사람인·원티드 + 잡코리아 또는 영어/해외 직무는 LinkedIn). 검색 결과 페이지로만 연결하고 공고를 만들어내지 않는다.

## 화면

해석 카드 → 핵심 진단(병목 + 역량 갭 보유/부분/부족 + 증명 방법) → 3단계 계획(완료 기준) → 이번 주 할 일(체크 상태를 결과 해시별로 localStorage에 저장, 실패해도 동작) → 이력서 문장(복사) → 예상 면접 질문 → 상황별 리스크 → 추천 리소스(새 탭, `noopener noreferrer`, 분류별, 추천 이유) → (로그인 시) 쿼카 인사이트 → 미래 장면. 한·영 문구는 `app/i18n.ts`, 스타일은 `app/compass.css`. 저장(Supabase) 구조는 바꾸지 않는다.

## 명언 중복 방지 연동

화면이 `recentQuoteIds`를 보내고 서버가 30개 이하의 짧은 문자열 배열만 받아 `exclude`로 명언 선택에 넘긴다. 결과 표시 후 명언 id를 기억한다(`lib/career/recent-quotes.ts`, 명언 담당 작업).

## 검증

- 2026-09-25 `npm run check`: 타입 검사 통과, 전체 89개 테스트 통과(새 `tests/compass.test.ts`, `tests/resources.test.ts`, 보강한 `tests/guidance.test.ts` 포함). `npm run build` 통과.
- Gemini 응답은 가짜 fetch로 확인: 전체 응답 → ai와 모든 섹션, 선택 항목만 잘못됨 → ai 유지 + 기본 제안 표시, 스키마 400 → 스키마 없이 재요청 후 ai, 깨진 JSON → 1회 재시도 후 basic, 503 → 재시도 없이 basic, AI 출력의 URL 제거, 목록에 없는 id 무시, 최근 명언 id 제외.
- 리소스 URL 45개 + 검색 링크 패턴 6개 HTTP 확인. 봇 차단으로 403이 나온 Behance·잡플래닛은 실제 브라우저에서 정상 표시 확인. 기록: `exports/resource-verification-2026-09-25.txt`.
- 로컬 개발 서버에서 기본 결과와 AI 형태 결과(브라우저에서 응답을 바꿔 확인) 화면 확인: 375px에서 가로 넘침 없음, 링크·버튼·체크 항목 높이 44px 이상, 체크 상태 localStorage 저장, 1280px에서 면접·리스크 2열.
- 발견해 고친 문제: 표시용 명리 용어 정리 규칙이 "병목"→"기본 성향", "7일간"→"7특성"처럼 일반 단어를 바꾸던 문제를 수정하고 회귀 테스트 추가.
- 실제 Gemini 키 호출은 로컬에 키가 없어 확인하지 못함. 배포 뒤 실제 응답의 스키마 수용 여부와 AI 비율은 확인이 필요하다.
