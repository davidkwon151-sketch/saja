# 커리어 명언·격언 출처

결과 마지막 장면에는 고민과 연결한 **영문 명언 한 개**와 **영문 격언 한 개**를 원문 그대로 보여 주고, 한국어 화면에서는 원문 아래에 한국어 번역을 함께 표시합니다. 모든 문장에는 출처 표기와 확인 가능한 https 원문 링크를 붙입니다.

## 원칙

- 짧은 발췌만 사용합니다(한 문장 또는 두세 문장, 40단어 이하). 긴 연설문·페이지를 복제하지 않습니다.
- 출처 페이지에서 원문을 확인하지 못한 문장은 쓰지 않습니다. 특히 유명인에게 널리 붙어 다니지만 확인되지 않은 문장(예: Wikiquote의 Disputed·Misattributed 구역)은 쓰지 않습니다.
- 격언은 특정 개인의 발언으로 표시하지 않고 "Japanese proverb", "Swahili proverb · 원어"처럼 문화권으로 표기합니다.
- 번역은 앱에서 직접 쓴 의역이며, 원문 옆에 보조로만 표시합니다.
- 위키인용집 페이지의 편집·배열은 [CC BY-SA 조건](https://en.wikiquote.org/wiki/Wikiquote:Copyrights)을 따르며, 화면에는 짧은 문구와 출처 링크를 함께 표시합니다. 이 문서는 법률 판단이나 개별 문구의 저작권 상태에 대한 보증이 아닙니다.

## 확인 방법 (2026-09-25)

`exports/verify-quotes-2026-09-25.mjs`가 후보 목록(`exports/quote-candidates-2026-09-25.json`)의 각 출처 페이지를 내려받아 확인합니다.

1. 본문(MediaWiki `mw-parser-output`)만 남기고, 목차·이미지 설명·`data-mw` 속성 안의 위키 원문을 지웁니다.
2. `<h2>` 구역과 그 안의 `<h3>`/`<h4>` 하위 구역으로 나눕니다.
3. 원문과 페이지를 같은 방식으로 정규화합니다(굽은 따옴표·대시 → ASCII, 소문자, 문장부호 제거, 공백 정리).
4. 처음 일치한 위치가 Disputed, Misattributed, Quotes about…, About…, See also, Attributed, Unsourced 구역이면 제외합니다.
5. 페이지에 표현이 조금 다른 판본이 있으면 페이지 문구로 고쳐 다시 확인하고, 끝내 확인되지 않는 후보는 제외합니다.

통과한 항목만 `exports/build-quote-pool-2026-09-25.mjs`로 `lib/career/quotes.ts`의 `QUOTE_POOL`에 넣습니다. 전체 결과는 `exports/quote-verification-2026-09-25.txt`에 있습니다.

## 결과 요약

- 후보 149개 중 **113개 통과**: 명언 59개, 격언 54개.
- 격언 문화권: 영어, 일본, 한국, 중국, 라틴, 프랑스, 독일, 러시아, 스와힐리, 하와이, 에스토니아, 타밀, 스웨덴, 핀란드, 아일랜드, 마오리, 인도, 체코.
- 명언 인물: 세네카, 에픽테토스, 마르쿠스 아우렐리우스, 키르케고르, 베케트, 애니 딜러드, 메리 올리버, 릴케, 마야 안젤루, 토니 모리슨, 파인만, 반 고흐, 카뮈, 어슐러 르 귄, 제임스 볼드윈, 아나이스 닌, 순자, 미야모토 무사시, 타고르, 아리스토텔레스, 플라톤, 파스퇴르, 브레네 브라운, 존 우든 등.

### 제외한 후보와 이유 (36개)

| 이유 | 후보 |
| --- | --- |
| Disputed 구역에서 처음 발견 | "It is not the mountain we conquer but ourselves." (Edmund Hillary 페이지 — 실제 기원은 George Mallory로 추정) |
| 출처 페이지에 해당 문장이 없음 | Emerson "Nothing great was ever achieved without enthusiasm", Angelou "Nothing will work unless you do", Octavia Butler "First forget inspiration…", Steve Martin "Be so good…", Arthur Ashe "Start where you are…", Frankl "When we are no longer able…", Gaiman "Make good art", Dweck, Maslow, Dolly Parton, Bezos, Hamming, Bruce Lee, Sandberg, Paul Graham, O'Keeffe, Nadella 등 |
| 출처 페이지 없음(404) 또는 접근 차단(403) | Reid Hoffman, "African proverbs" 페이지(“If you want to go fast…”), Stanford 뉴스 페이지("You can only connect them looking backwards") |
| 격언 페이지에 해당 번역이 없음 | Little strokes fell great oaks, Great oaks from little acorns grow, It is never too late to learn, 일본 "티끌 모아 태산", 한국 "하늘이 무너져도…", "백지장도 맞들면 낫다", 중국 "Dig the well…", "The best time to plant a tree…", Per aspera ad astra, 프랑스 "Little by little, the bird…", 독일 "No master has fallen from the sky", 러시아 "늑대가 무섭다면…", 터키 "잘못된 길…", 아랍 "Trust in God, but tie your camel" |
| 수동 제외 | George Eliot "It is never too late to be what you might have been." — Wikiquote에 쪽·장 표기 없이 올라 있어 확인되지 않은 귀속으로 판단 |

## 이전 목록과의 관계

2026-09-23 목록의 문장 중 확인이 유지되는 것(Helen Keller·AFB, Benjamin Franklin·Project Gutenberg, Steve Jobs "Your time is limited…", "Stay hungry. Stay foolish."(Jobs가 연설에서 인용한 Whole Earth Catalog 문구), 영어 속담 "Every cloud has a silver lining", "Many hands make light work")은 풀에 남아 있습니다. Stanford 뉴스 페이지는 2026-09-25 자동 확인에서 접근이 차단되어, Jobs 문장은 연설 원문이 수록된 [Wikiquote: Steve Jobs](https://en.wikiquote.org/wiki/Steve_Jobs)의 "Address at Stanford University (2005)" 구역으로 확인합니다.
