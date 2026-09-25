// 결과 마지막 장면의 명언(quote)·격언(proverb) 선택.
// - 모든 문장은 exports/verify-quotes-2026-09-25.mjs 로 출처 페이지에서 원문을 확인한 것만 싣는다.
//   (검증 로그: exports/quote-verification-2026-09-25.txt, 출처 정책: docs/quote-sources.md)
// - 화면에는 영어 원문을 그대로 보여 주고, 한국어 화면에서는 번역을 함께 준다.
// - 고민·상태·직무를 여러 태그 가중치로 분석한 뒤, 상위 후보 중에서 가중 무작위로 고른다.

export type QuoteTag =
  | "start"
  | "setback"
  | "skill"
  | "change"
  | "together"
  | "gap"
  | "patience"
  | "direction"
  | "courage"
  | "balance";

export type QuotePoolItem = {
  id: string;
  kind: "quote" | "proverb";
  text: string;
  translation: { ko: string };
  attribution: string;
  sourceUrl: string;
  tags: readonly QuoteTag[];
};

export type CareerQuote = {
  id: string;
  text: string;
  translation?: string;
  attribution?: string;
  sourceUrl?: string;
  connection?: string;
};

export type QuoteInput = {
  age: number;
  concern: string;
  role: string;
  status: string;
  language: "ko" | "en";
  exclude?: string[];
  random?: () => number;
};

// 생성: node exports/build-quote-pool-2026-09-25.mjs (검증 통과 항목만 들어간다)
export const QUOTE_POOL: readonly QuotePoolItem[] = [
  // <pool>
  { id: "seneca-dare", kind: "quote", text: "It is not because things are difficult that we do not dare, but because we do not dare, things are difficult.", translation: { ko: "일이 어려워서 감히 못 하는 것이 아니라, 감히 하지 않기 때문에 일이 어려워지는 것이다." }, attribution: "Seneca · Moral Letters", sourceUrl: "https://en.wikiquote.org/wiki/Seneca_the_Younger", tags: ["courage", "start"] },
  { id: "seneca-port", kind: "quote", text: "If one does not know to which port one is sailing, no wind is favorable.", translation: { ko: "어느 항구로 가는지 모르는 사람에게는 어떤 바람도 순풍이 되지 않는다." }, attribution: "Seneca · Moral Letters", sourceUrl: "https://en.wikiquote.org/wiki/Seneca_the_Younger", tags: ["direction"] },
  { id: "seneca-begin", kind: "quote", text: "Begin at once to live, and count each separate day as a separate life.", translation: { ko: "지금 바로 살기 시작하라. 하루하루를 하나의 온전한 삶으로 여겨라." }, attribution: "Seneca · Moral Letters", sourceUrl: "https://en.wikiquote.org/wiki/Seneca_the_Younger", tags: ["start", "balance"] },
  { id: "seneca-postponing", kind: "quote", text: "While we are postponing, life speeds by.", translation: { ko: "우리가 미루는 동안 삶은 빠르게 지나간다." }, attribution: "Seneca · Moral Letters", sourceUrl: "https://en.wikiquote.org/wiki/Seneca_the_Younger", tags: ["start", "gap"] },
  { id: "epictetus-first-say", kind: "quote", text: "First say to yourself what you would be; and then do what you have to do.", translation: { ko: "먼저 어떤 사람이 되고 싶은지 스스로에게 말하라. 그다음 해야 할 일을 하라." }, attribution: "Epictetus · Discourses", sourceUrl: "https://en.wikiquote.org/wiki/Epictetus", tags: ["direction", "start"] },
  { id: "aurelius-obstacle", kind: "quote", text: "What stands in the way becomes the way.", translation: { ko: "길을 가로막는 것이 곧 길이 된다." }, attribution: "Marcus Aurelius · Meditations", sourceUrl: "https://en.wikiquote.org/wiki/Marcus_Aurelius", tags: ["setback", "gap"] },
  { id: "kierkegaard-backwards", kind: "quote", text: "Life can only be understood backwards; but it must be lived forwards.", translation: { ko: "삶은 뒤돌아볼 때에야 이해되지만, 살아가는 것은 앞을 향해서다." }, attribution: "Søren Kierkegaard · Journals", sourceUrl: "https://en.wikiquote.org/wiki/S%C3%B8ren_Kierkegaard", tags: ["direction", "change", "gap"] },
  { id: "beckett-fail-better", kind: "quote", text: "Ever tried. Ever failed. No matter. Try Again. Fail again. Fail better.", translation: { ko: "시도했고, 실패했다. 괜찮다. 다시 시도하라. 다시 실패하라. 더 낫게 실패하라." }, attribution: "Samuel Beckett · Worstward Ho", sourceUrl: "https://en.wikiquote.org/wiki/Samuel_Beckett", tags: ["setback", "skill"] },
  { id: "dillard-days", kind: "quote", text: "How we spend our days is, of course, how we spend our lives.", translation: { ko: "하루를 어떻게 보내는가가 곧 삶을 어떻게 보내는가이다." }, attribution: "Annie Dillard · The Writing Life", sourceUrl: "https://en.wikiquote.org/wiki/Annie_Dillard", tags: ["balance", "patience"] },
  { id: "oliver-wild", kind: "quote", text: "Tell me, what is it you plan to do with your one wild and precious life?", translation: { ko: "말해 보세요, 단 한 번뿐인 거칠고 소중한 삶으로 무엇을 하려 하나요?" }, attribution: "Mary Oliver · The Summer Day", sourceUrl: "https://en.wikiquote.org/wiki/Mary_Oliver", tags: ["direction", "change"] },
  { id: "rilke-questions", kind: "quote", text: "Live the questions now.", translation: { ko: "지금은 질문 그 자체를 살아가라." }, attribution: "Rainer Maria Rilke · Letters to a Young Poet", sourceUrl: "https://en.wikiquote.org/wiki/Rainer_Maria_Rilke", tags: ["direction", "patience"] },
  { id: "angelou-defeats", kind: "quote", text: "We may encounter many defeats, but we must not be defeated.", translation: { ko: "우리는 많은 패배를 겪을 수 있지만, 패배해서는 안 된다." }, attribution: "Maya Angelou", sourceUrl: "https://en.wikiquote.org/wiki/Maya_Angelou", tags: ["setback", "gap"] },
  { id: "morrison-write-it", kind: "quote", text: "If you find a book you really want to read but it hasn't been written yet, then you must write it.", translation: { ko: "정말 읽고 싶은 책이 아직 쓰이지 않았다면, 당신이 써야 한다." }, attribution: "Toni Morrison", sourceUrl: "https://en.wikiquote.org/wiki/Toni_Morrison", tags: ["change", "direction"] },
  { id: "feynman-fool", kind: "quote", text: "The first principle is that you must not fool yourself — and you are the easiest person to fool.", translation: { ko: "첫 번째 원칙은 자기 자신을 속이지 않는 것이다. 그리고 가장 속이기 쉬운 사람이 바로 자신이다." }, attribution: "Richard Feynman · Cargo Cult Science", sourceUrl: "https://en.wikiquote.org/wiki/Richard_Feynman", tags: ["skill", "direction"] },
  { id: "curie-understood", kind: "quote", text: "In life, there's nothing to be feared, everything is to be understood.", translation: { ko: "삶에서 두려워할 것은 없다. 모든 것은 이해해야 할 대상일 뿐이다." }, attribution: "Marie Curie", sourceUrl: "https://en.wikiquote.org/wiki/Marie_Curie", tags: ["courage", "change"] },
  { id: "troosevelt-do-what", kind: "quote", text: "Do what you can, with what you have, where you are.", translation: { ko: "지금 있는 곳에서, 가진 것으로, 할 수 있는 것을 하라." }, attribution: "Theodore Roosevelt · An Autobiography", sourceUrl: "https://en.wikiquote.org/wiki/Theodore_Roosevelt", tags: ["start", "gap", "balance"] },
  { id: "eroosevelt-cannot", kind: "quote", text: "You must do the thing you think you cannot do.", translation: { ko: "할 수 없다고 생각하는 바로 그 일을 해야 한다." }, attribution: "Eleanor Roosevelt · You Learn by Living", sourceUrl: "https://en.wikiquote.org/wiki/Eleanor_Roosevelt", tags: ["courage", "change"] },
  { id: "douglass-struggle", kind: "quote", text: "If there is no struggle, there is no progress.", translation: { ko: "애쓰지 않으면 나아감도 없다." }, attribution: "Frederick Douglass", sourceUrl: "https://en.wikiquote.org/wiki/Frederick_Douglass", tags: ["setback", "skill"] },
  { id: "vangogh-small", kind: "quote", text: "Great things are not done by impulse, but by a series of small things brought together.", translation: { ko: "위대한 일은 충동이 아니라 작은 일들이 차곡차곡 모여 이루어진다." }, attribution: "Vincent van Gogh · Letter to Theo", sourceUrl: "https://en.wikiquote.org/wiki/Vincent_van_Gogh", tags: ["patience", "skill"] },
  { id: "camus-summer", kind: "quote", text: "In the middle of winter I at last discovered that there was in me an invincible summer.", translation: { ko: "한겨울 한가운데에서, 마침내 내 안에 꺾이지 않는 여름이 있음을 알았다." }, attribution: "Albert Camus · Return to Tipasa", sourceUrl: "https://en.wikiquote.org/wiki/Albert_Camus", tags: ["setback", "gap"] },
  { id: "leguin-journey", kind: "quote", text: "It is good to have an end to journey towards; but it is the journey that matters, in the end.", translation: { ko: "향해 갈 목적지가 있는 것은 좋다. 하지만 결국 중요한 것은 그 여정이다." }, attribution: "Ursula K. Le Guin · The Left Hand of Darkness", sourceUrl: "https://en.wikiquote.org/wiki/Ursula_K._Le_Guin", tags: ["patience", "direction"] },
  { id: "earhart-decision", kind: "quote", text: "The most difficult thing is the decision to act, the rest is merely tenacity.", translation: { ko: "가장 어려운 것은 행동하겠다는 결심이다. 나머지는 끈기일 뿐이다." }, attribution: "Amelia Earhart", sourceUrl: "https://en.wikiquote.org/wiki/Amelia_Earhart", tags: ["start", "courage"] },
  { id: "kay-invent", kind: "quote", text: "The best way to predict the future is to invent it.", translation: { ko: "미래를 예측하는 가장 좋은 방법은 미래를 직접 만드는 것이다." }, attribution: "Alan Kay", sourceUrl: "https://en.wikiquote.org/wiki/Alan_Kay", tags: ["change", "direction"] },
  { id: "pausch-brick", kind: "quote", text: "The brick walls are there to give us a chance to show how badly we want something.", translation: { ko: "벽은 우리가 무언가를 얼마나 간절히 원하는지 보여 줄 기회를 주려고 거기 있다." }, attribution: "Randy Pausch · The Last Lecture", sourceUrl: "https://en.wikiquote.org/wiki/Randy_Pausch", tags: ["setback", "gap"] },
  { id: "baldwin-faced", kind: "quote", text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.", translation: { ko: "마주한다고 모두 바뀌지는 않지만, 마주하기 전에는 아무것도 바뀌지 않는다." }, attribution: "James Baldwin", sourceUrl: "https://en.wikiquote.org/wiki/James_Baldwin", tags: ["courage", "gap", "direction"] },
  { id: "nin-courage", kind: "quote", text: "Life shrinks or expands according to one's courage.", translation: { ko: "삶은 용기에 따라 줄어들기도, 넓어지기도 한다." }, attribution: "Anaïs Nin", sourceUrl: "https://en.wikiquote.org/wiki/Ana%C3%AFs_Nin", tags: ["courage", "change"] },
  { id: "vonnegut-cliffs", kind: "quote", text: "We have to continually be jumping off cliffs and developing our wings on the way down.", translation: { ko: "우리는 계속 절벽에서 뛰어내리고, 떨어지는 동안 날개를 키워야 한다." }, attribution: "Kurt Vonnegut", sourceUrl: "https://en.wikiquote.org/wiki/Kurt_Vonnegut", tags: ["change", "courage"] },
  { id: "voltaire-best", kind: "quote", text: "The best is the enemy of the good.", translation: { ko: "최선을 고집하면 좋은 것을 놓친다." }, attribution: "Voltaire", sourceUrl: "https://en.wikiquote.org/wiki/Voltaire", tags: ["skill", "start", "balance"] },
  { id: "horace-begun", kind: "quote", text: "He who has begun has half done. Dare to be wise; begin!", translation: { ko: "시작한 사람은 이미 절반을 해낸 것이다. 현명해질 용기를 내라, 시작하라!" }, attribution: "Horace · Epistles", sourceUrl: "https://en.wikiquote.org/wiki/Horace", tags: ["start", "courage"] },
  { id: "publilius-practice", kind: "quote", text: "Practice is the best of all instructors.", translation: { ko: "연습은 모든 스승 가운데 최고의 스승이다." }, attribution: "Publilius Syrus · Sententiae", sourceUrl: "https://en.wikiquote.org/wiki/Publilius_Syrus", tags: ["skill"] },
  { id: "keller-together", kind: "quote", text: "Alone we can do so little; together we can do so much.", translation: { ko: "혼자서는 할 수 있는 것이 적지만, 함께라면 많은 것을 할 수 있다." }, attribution: "Helen Keller · American Foundation for the Blind", sourceUrl: "https://afb.org/about-afb/history/helen-keller/quotes/helen-keller-quotes-progress", tags: ["together"] },
  { id: "franklin-well-done", kind: "quote", text: "Well done is better than well said.", translation: { ko: "잘 말하는 것보다 잘 해내는 것이 낫다." }, attribution: "Benjamin Franklin · Poor Richard's Almanac", sourceUrl: "https://www.gutenberg.org/cache/epub/36151/pg36151-images.html", tags: ["skill"] },
  { id: "jobs-limited", kind: "quote", text: "Your time is limited, so don't waste it living someone else's life.", translation: { ko: "시간은 한정되어 있으니, 다른 사람의 삶을 사느라 낭비하지 마라." }, attribution: "Steve Jobs · Stanford commencement", sourceUrl: "https://en.wikiquote.org/wiki/Steve_Jobs", tags: ["change", "direction"] },
  { id: "jobs-hungry", kind: "quote", text: "Stay hungry. Stay foolish.", translation: { ko: "늘 갈망하고, 우직하게 나아가라." }, attribution: "The Whole Earth Catalog · quoted by Steve Jobs", sourceUrl: "https://en.wikiquote.org/wiki/Steve_Jobs", tags: ["start"] },
  { id: "confucius-learn", kind: "quote", text: "Learning without thought is labor lost; thought without learning is perilous.", translation: { ko: "배우기만 하고 생각하지 않으면 얻는 것이 없고, 생각만 하고 배우지 않으면 위태롭다." }, attribution: "Confucius · Analects", sourceUrl: "https://en.wikiquote.org/wiki/Confucius", tags: ["skill", "direction"] },
  { id: "laozi-journey", kind: "quote", text: "A journey of a thousand li starts with a single step.", translation: { ko: "천 리 길도 한 걸음에서 시작된다." }, attribution: "Laozi · Tao Te Ching", sourceUrl: "https://en.wikiquote.org/wiki/Laozi", tags: ["start", "patience"] },
  { id: "heraclitus-river", kind: "quote", text: "You could not step twice into the same river.", translation: { ko: "같은 강물에 두 번 발을 담글 수는 없다." }, attribution: "Heraclitus", sourceUrl: "https://en.wikiquote.org/wiki/Heraclitus", tags: ["change"] },
  { id: "ovid-drop", kind: "quote", text: "Drops of water hollow out a stone.", translation: { ko: "물방울이 바위를 뚫는다." }, attribution: "Ovid · Epistulae ex Ponto", sourceUrl: "https://en.wikiquote.org/wiki/Ovid", tags: ["patience", "skill"] },
  { id: "hemingway-broken", kind: "quote", text: "The world breaks everyone and afterward many are strong at the broken places.", translation: { ko: "세상은 모두를 부러뜨리지만, 그 뒤 많은 이가 부러졌던 자리에서 더 강해진다." }, attribution: "Ernest Hemingway · A Farewell to Arms", sourceUrl: "https://en.wikiquote.org/wiki/Ernest_Hemingway", tags: ["setback", "gap"] },
  { id: "frost-through", kind: "quote", text: "The best way out is always through.", translation: { ko: "빠져나가는 가장 좋은 길은 언제나 통과하는 것이다." }, attribution: "Robert Frost · A Servant to Servants", sourceUrl: "https://en.wikiquote.org/wiki/Robert_Frost", tags: ["setback", "patience"] },
  { id: "aristotle-doing", kind: "quote", text: "For the things we have to learn before we can do, we learn by doing.", translation: { ko: "해내기 전에 배워야 하는 것들은, 해 보면서 배운다." }, attribution: "Aristotle · Nicomachean Ethics", sourceUrl: "https://en.wikiquote.org/wiki/Aristotle", tags: ["skill", "start"] },
  { id: "plato-beginning", kind: "quote", text: "The beginning is the most important part of any work.", translation: { ko: "시작은 모든 일에서 가장 중요한 부분이다." }, attribution: "Plato · The Republic", sourceUrl: "https://en.wikiquote.org/wiki/Plato", tags: ["start"] },
  { id: "pasteur-prepared", kind: "quote", text: "In the fields of observation chance favours only the prepared mind.", translation: { ko: "관찰의 영역에서 기회는 준비된 사람에게만 미소 짓는다." }, attribution: "Louis Pasteur · Lecture, University of Lille", sourceUrl: "https://en.wikiquote.org/wiki/Louis_Pasteur", tags: ["skill", "gap"] },
  { id: "tagore-sea", kind: "quote", text: "You can't cross the sea merely by standing and staring at the water.", translation: { ko: "바닷가에 서서 물만 바라보고 있어서는 바다를 건널 수 없다." }, attribution: "Rabindranath Tagore", sourceUrl: "https://en.wikiquote.org/wiki/Rabindranath_Tagore", tags: ["start", "courage"] },
  { id: "einstein-bicycle", kind: "quote", text: "Life is like riding a bicycle. To keep your balance you must keep moving.", translation: { ko: "삶은 자전거를 타는 것과 같다. 균형을 잡으려면 계속 움직여야 한다." }, attribution: "Albert Einstein · Letter to his son Eduard", sourceUrl: "https://en.wikiquote.org/wiki/Albert_Einstein", tags: ["balance", "change"] },
  { id: "frank-moment", kind: "quote", text: "How wonderful it is that nobody need wait a single moment before beginning to improve the world!", translation: { ko: "세상을 더 낫게 만들기 시작하는 데 단 한순간도 기다릴 필요가 없다는 건 얼마나 멋진 일인가!" }, attribution: "Anne Frank · Diary", sourceUrl: "https://en.wikiquote.org/wiki/Anne_Frank", tags: ["start"] },
  { id: "xunzi-death", kind: "quote", text: "Learning proceeds until death and only then does it stop.", translation: { ko: "배움은 죽을 때까지 이어지고, 그때가 되어서야 멈춘다." }, attribution: "Xunzi · An Exhortation to Learning", sourceUrl: "https://en.wikiquote.org/wiki/Xunzi", tags: ["skill", "gap"] },
  { id: "xunzi-practice", kind: "quote", text: "Knowing it is not as good as putting it into practice.", translation: { ko: "아는 것은 실천하는 것만 못하다." }, attribution: "Xunzi", sourceUrl: "https://en.wikiquote.org/wiki/Xunzi", tags: ["skill"] },
  { id: "musashi-yesterday", kind: "quote", text: "Today is victory over yourself of yesterday", translation: { ko: "오늘은 어제의 나를 이기는 날이다." }, attribution: "Miyamoto Musashi · The Book of Five Rings", sourceUrl: "https://en.wikiquote.org/wiki/Miyamoto_Musashi", tags: ["skill", "patience"] },
  { id: "thoreau-dreams", kind: "quote", text: "If one advances confidently in the direction of his dreams, and endeavors to live the life which he has imagined, he will meet with a success unexpected in common hours", translation: { ko: "꿈의 방향으로 자신 있게 나아가며 상상한 삶을 살려고 애쓰면, 평범한 시간에는 기대하지 못한 성공을 만나게 된다." }, attribution: "Henry David Thoreau · Walden", sourceUrl: "https://en.wikiquote.org/wiki/Henry_David_Thoreau", tags: ["direction", "courage"] },
  { id: "edison-perspiration", kind: "quote", text: "Genius is one percent inspiration, ninety-nine percent perspiration.", translation: { ko: "천재는 1퍼센트의 영감과 99퍼센트의 노력으로 이루어진다." }, attribution: "Thomas Edison", sourceUrl: "https://en.wikiquote.org/wiki/Thomas_Edison", tags: ["skill", "patience"] },
  { id: "wooden-failure", kind: "quote", text: "Failure is not fatal but failure to change might be.", translation: { ko: "실패는 치명적이지 않다. 치명적인 것은 바뀌지 못하는 것이다." }, attribution: "John Wooden", sourceUrl: "https://en.wikiquote.org/wiki/John_Wooden", tags: ["setback", "change"] },
  { id: "wooden-team", kind: "quote", text: "A player who makes a team great is more valuable than a great player.", translation: { ko: "팀을 위대하게 만드는 선수가 위대한 선수보다 더 값지다." }, attribution: "John Wooden", sourceUrl: "https://en.wikiquote.org/wiki/John_Wooden", tags: ["together"] },
  { id: "brown-vulnerability", kind: "quote", text: "Vulnerability is not weakness; it's our greatest measure of courage.", translation: { ko: "취약함은 약함이 아니라, 용기를 재는 가장 큰 척도다." }, attribution: "Brené Brown", sourceUrl: "https://en.wikiquote.org/wiki/Bren%C3%A9_Brown", tags: ["courage", "gap"] },
  { id: "aesop-steady", kind: "quote", text: "Slow and steady wins the race.", translation: { ko: "느리더라도 꾸준하면 경주에서 이긴다." }, attribution: "Aesop · The Hare and the Tortoise", sourceUrl: "https://en.wikiquote.org/wiki/Aesop", tags: ["patience"] },
  { id: "lamott-unplug", kind: "quote", text: "Almost everything will work again if you unplug it for a few minutes, including you.", translation: { ko: "거의 모든 것은 잠시 플러그를 뽑았다가 다시 꽂으면 다시 작동한다. 당신도 마찬가지다." }, attribution: "Anne Lamott", sourceUrl: "https://en.wikiquote.org/wiki/Anne_Lamott", tags: ["balance"] },
  { id: "berra-going", kind: "quote", text: "If you don't know where you're going, you might not get there.", translation: { ko: "어디로 가는지 모르면, 그곳에 도착하지 못할 수도 있다." }, attribution: "Yogi Berra", sourceUrl: "https://en.wikiquote.org/wiki/Yogi_Berra", tags: ["direction"] },
  { id: "ruth-strike", kind: "quote", text: "Every strike brings me closer to the next home run.", translation: { ko: "삼진 하나하나가 다음 홈런에 나를 더 가까이 데려간다." }, attribution: "Babe Ruth", sourceUrl: "https://en.wikiquote.org/wiki/Babe_Ruth", tags: ["setback"] },
  { id: "jordan-teamwork", kind: "quote", text: "Talent wins games, but teamwork and intelligence wins championships.", translation: { ko: "재능은 경기를 이기게 하지만, 팀워크와 지혜는 우승을 가져온다." }, attribution: "Michael Jordan · I Can't Accept Not Trying", sourceUrl: "https://en.wikiquote.org/wiki/Michael_Jordan", tags: ["together"] },
  { id: "en-rome", kind: "proverb", text: "Rome wasn't built in a day.", translation: { ko: "로마는 하루아침에 세워지지 않았다." }, attribution: "English proverb", sourceUrl: "https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)", tags: ["patience"] },
  { id: "en-pudding", kind: "proverb", text: "The proof of the pudding is in the eating.", translation: { ko: "푸딩 맛은 먹어 봐야 안다. 증명은 결과로 한다." }, attribution: "English proverb", sourceUrl: "https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)", tags: ["skill"] },
  { id: "en-nothing-ventured", kind: "proverb", text: "Nothing ventured, nothing gained.", translation: { ko: "모험하지 않으면 얻는 것도 없다." }, attribution: "English proverb", sourceUrl: "https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)", tags: ["courage", "change"] },
  { id: "en-necessity", kind: "proverb", text: "Necessity is the mother of invention.", translation: { ko: "필요는 발명의 어머니다." }, attribution: "English proverb", sourceUrl: "https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)", tags: ["gap", "change"] },
  { id: "en-actions", kind: "proverb", text: "Actions speak louder than words.", translation: { ko: "행동은 말보다 더 크게 말한다." }, attribution: "English proverb", sourceUrl: "https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)", tags: ["skill"] },
  { id: "en-silver", kind: "proverb", text: "Every cloud has a silver lining.", translation: { ko: "모든 먹구름에는 은빛 테두리가 있다. 어려움 속에도 희망은 있다." }, attribution: "English proverb", sourceUrl: "https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)", tags: ["setback"] },
  { id: "en-many-hands", kind: "proverb", text: "Many hands make light work.", translation: { ko: "손이 많으면 일이 가벼워진다." }, attribution: "English proverb", sourceUrl: "https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)", tags: ["together"] },
  { id: "en-eggs", kind: "proverb", text: "Don't put all your eggs in one basket.", translation: { ko: "달걀을 한 바구니에 모두 담지 마라." }, attribution: "English proverb", sourceUrl: "https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)", tags: ["balance", "direction"] },
  { id: "jp-seven-eight", kind: "proverb", text: "Fall down seven times, get up eight.", translation: { ko: "일곱 번 넘어져도 여덟 번 일어난다." }, attribution: "Japanese proverb", sourceUrl: "https://en.wikiquote.org/wiki/Japanese_proverbs", tags: ["setback", "gap"] },
  { id: "jp-monkeys", kind: "proverb", text: "Even monkeys fall from trees.", translation: { ko: "원숭이도 나무에서 떨어진다." }, attribution: "Japanese proverb", sourceUrl: "https://en.wikiquote.org/wiki/Japanese_proverbs", tags: ["setback"] },
  { id: "jp-tiger", kind: "proverb", text: "If you do not enter the tiger's cave, you will not catch its cub.", translation: { ko: "호랑이 굴에 들어가지 않으면 호랑이 새끼를 잡을 수 없다." }, attribution: "Japanese proverb", sourceUrl: "https://en.wikiquote.org/wiki/Japanese_proverbs", tags: ["courage", "change"] },
  { id: "jp-rock", kind: "proverb", text: "Three years on a rock", translation: { ko: "바위 위에서도 3년. 차가운 바위도 3년을 앉아 있으면 따뜻해진다." }, attribution: "Japanese proverb", sourceUrl: "https://en.wikiquote.org/wiki/Japanese_proverbs", tags: ["patience"] },
  { id: "jp-little-strokes", kind: "proverb", text: "With many little strokes a large tree is felled.", translation: { ko: "작은 도끼질이 여러 번 쌓이면 큰 나무도 쓰러진다." }, attribution: "Japanese proverb", sourceUrl: "https://en.wikiquote.org/wiki/Japanese_proverbs", tags: ["patience", "skill"] },
  { id: "kr-half", kind: "proverb", text: "Starting is half the task.", translation: { ko: "시작이 반이다." }, attribution: "Korean proverb", sourceUrl: "https://en.wikiquote.org/wiki/Korean_proverbs", tags: ["start"] },
  { id: "kr-will-road", kind: "proverb", text: "In a place where there is will, there is a road.", translation: { ko: "뜻이 있는 곳에 길이 있다." }, attribution: "Korean proverb", sourceUrl: "https://en.wikiquote.org/wiki/Korean_proverbs", tags: ["direction", "gap"] },
  { id: "cn-teachers", kind: "proverb", text: "Teachers open the door. You enter by yourself.", translation: { ko: "스승은 문을 열어 줄 뿐, 들어가는 것은 스스로 해야 한다." }, attribution: "Chinese proverb", sourceUrl: "https://en.wikiquote.org/wiki/Chinese_proverbs", tags: ["skill", "together"] },
  { id: "cn-windmills", kind: "proverb", text: "When the wind changes direction, some people build walls while others build windmills", translation: { ko: "바람의 방향이 바뀌면 어떤 이는 벽을 쌓고, 어떤 이는 풍차를 세운다." }, attribution: "Chinese proverb", sourceUrl: "https://en.wikiquote.org/wiki/Chinese_proverbs", tags: ["change"] },
  { id: "la-festina", kind: "proverb", text: "Make haste slowly.", translation: { ko: "천천히 서둘러라." }, attribution: "Latin proverb · Festina lente", sourceUrl: "https://en.wikiquote.org/wiki/Latin_proverbs", tags: ["balance", "patience"] },
  { id: "la-fortune", kind: "proverb", text: "Fortune favors the bold.", translation: { ko: "행운은 용감한 자의 편이다." }, attribution: "Latin proverb · Audentes fortuna juvat", sourceUrl: "https://en.wikiquote.org/wiki/Latin_proverbs", tags: ["courage", "change"] },
  { id: "la-docendo", kind: "proverb", text: "By teaching, we learn.", translation: { ko: "가르치면서 우리는 배운다." }, attribution: "Latin proverb · Docendo discimus", sourceUrl: "https://en.wikiquote.org/wiki/Latin_proverbs", tags: ["together", "skill"] },
  { id: "la-parvis", kind: "proverb", text: "Greatness from Small Beginnings.", translation: { ko: "위대함은 작은 시작에서 나온다." }, attribution: "Latin proverb · Sic parvis magna", sourceUrl: "https://en.wikiquote.org/wiki/Latin_proverbs", tags: ["start", "patience"] },
  { id: "la-usus", kind: "proverb", text: "Experience is the best teacher.", translation: { ko: "경험이 최고의 스승이다." }, attribution: "Latin proverb · Usus magister est optimus", sourceUrl: "https://en.wikiquote.org/wiki/Latin_proverbs", tags: ["skill", "setback"] },
  { id: "la-quies", kind: "proverb", text: "Rest is the best medicine.", translation: { ko: "쉼이 최고의 약이다." }, attribution: "Latin proverb · Optimum medicamentum quies est", sourceUrl: "https://en.wikiquote.org/wiki/Latin_proverbs", tags: ["balance"] },
  { id: "la-non-solum", kind: "proverb", text: "We are not born for ourselves alone.", translation: { ko: "우리는 자기 자신만을 위해 태어나지 않았다." }, attribution: "Latin proverb · Non nobis solum nati sumus", sourceUrl: "https://en.wikiquote.org/wiki/Latin_proverbs", tags: ["together"] },
  { id: "fr-step-back", kind: "proverb", text: "One must step back to take a good leap.", translation: { ko: "멀리 뛰려면 한 걸음 물러서야 한다." }, attribution: "French proverb · Il faut reculer pour mieux sauter", sourceUrl: "https://en.wikiquote.org/wiki/French_proverbs", tags: ["gap", "change"] },
  { id: "de-persist", kind: "proverb", text: "To begin is easy, to persist is an art.", translation: { ko: "시작은 쉽고, 꾸준함은 기술이다." }, attribution: "German proverb · Anfangen ist leicht, beharren eine Kunst", sourceUrl: "https://en.wikiquote.org/wiki/German_proverbs", tags: ["patience", "start"] },
  { id: "ru-skilled", kind: "proverb", text: "Work is afraid of a skilled worker.", translation: { ko: "일은 숙련된 일꾼을 두려워한다." }, attribution: "Russian proverb", sourceUrl: "https://en.wikiquote.org/wiki/Russian_proverbs", tags: ["skill"] },
  { id: "ru-century", kind: "proverb", text: "Live for a century — learn for a century.", translation: { ko: "백 년을 살면 백 년을 배운다." }, attribution: "Russian proverb", sourceUrl: "https://en.wikiquote.org/wiki/Russian_proverbs", tags: ["skill", "gap"] },
  { id: "ru-no-mistakes", kind: "proverb", text: "Only he who does nothing makes no mistakes.", translation: { ko: "아무것도 하지 않는 사람만이 실수하지 않는다." }, attribution: "Russian proverb", sourceUrl: "https://en.wikiquote.org/wiki/Russian_proverbs", tags: ["setback", "courage"] },
  { id: "ru-repetition", kind: "proverb", text: "Repetition is the mother of learning.", translation: { ko: "반복은 배움의 어머니다." }, attribution: "Russian proverb", sourceUrl: "https://en.wikiquote.org/wiki/Russian_proverbs", tags: ["skill", "patience"] },
  { id: "ru-measure", kind: "proverb", text: "Measure seven times, cut once.", translation: { ko: "일곱 번 재고 한 번에 잘라라." }, attribution: "Russian proverb", sourceUrl: "https://en.wikiquote.org/wiki/Russian_proverbs", tags: ["direction", "balance"] },
  { id: "ru-patience-work", kind: "proverb", text: "Patience and work will fray through anything.", translation: { ko: "인내와 노력은 무엇이든 닳게 해 뚫어 낸다." }, attribution: "Russian proverb", sourceUrl: "https://en.wikiquote.org/wiki/Russian_proverbs", tags: ["patience"] },
  { id: "sw-star", kind: "proverb", text: "Don't set sail using somebody else's star.", translation: { ko: "남의 별을 보고 항해를 떠나지 마라." }, attribution: "Swahili proverb · Usisafirie nyota ya mwenzio", sourceUrl: "https://en.wikiquote.org/wiki/Swahili_proverbs", tags: ["direction"] },
  { id: "sw-person-people", kind: "proverb", text: "A person is people.", translation: { ko: "사람은 사람들 속에서 사람이 된다." }, attribution: "Swahili proverb · Mtu ni watu", sourceUrl: "https://en.wikiquote.org/wiki/Swahili_proverbs", tags: ["together"] },
  { id: "sw-hurry", kind: "proverb", text: "Hurry, hurry, has no blessings.", translation: { ko: "서두르고 또 서두르면 복이 없다." }, attribution: "Swahili proverb · Haraka haraka haina baraka", sourceUrl: "https://en.wikiquote.org/wiki/Swahili_proverbs", tags: ["balance", "patience"] },
  { id: "sw-bees", kind: "proverb", text: "Follow bees that you may eat honey.", translation: { ko: "꿀을 먹고 싶다면 벌을 따라가라." }, attribution: "Swahili proverb · Fuata nyuki ule asali", sourceUrl: "https://en.wikiquote.org/wiki/Swahili_proverbs", tags: ["together", "direction"] },
  { id: "haw-cliff", kind: "proverb", text: "No cliff is so tall it cannot be climbed.", translation: { ko: "오를 수 없을 만큼 높은 절벽은 없다." }, attribution: "Hawaiian proverb", sourceUrl: "https://en.wikiquote.org/wiki/Hawaiian_proverbs", tags: ["setback", "courage"] },
  { id: "et-fear-eyes", kind: "proverb", text: "Fear has big eyes.", translation: { ko: "두려움은 눈이 크다. 겁은 실제보다 크게 보이게 한다." }, attribution: "Estonian proverb · Hirmul on suured silmad", sourceUrl: "https://en.wikiquote.org/wiki/Estonian_proverbs", tags: ["courage"] },
  { id: "et-hand-alone", kind: "proverb", text: "A hand doesn't wash alone.", translation: { ko: "손은 혼자 씻지 못한다." }, attribution: "Estonian proverb · Üks käsi ei pese üksi", sourceUrl: "https://en.wikiquote.org/wiki/Estonian_proverbs", tags: ["together"] },
  { id: "et-morning-gold", kind: "proverb", text: "Morning work gold, evening work soil.", translation: { ko: "아침 일은 금, 저녁 일은 흙." }, attribution: "Estonian proverb · Hommikune töö kuld, õhtune muld", sourceUrl: "https://en.wikiquote.org/wiki/Estonian_proverbs", tags: ["balance"] },
  { id: "ta-creepers", kind: "proverb", text: "If tender creepers cling together there will be strength.", translation: { ko: "여린 덩굴도 서로 엉기면 힘이 된다." }, attribution: "Tamil proverb", sourceUrl: "https://en.wikiquote.org/wiki/Tamil_proverbs", tags: ["together"] },
  { id: "ta-somersault", kind: "proverb", text: "Rest on something solid and then make your somersault.", translation: { ko: "단단한 것을 딛고 나서 재주를 넘어라." }, attribution: "Tamil proverb", sourceUrl: "https://en.wikiquote.org/wiki/Tamil_proverbs", tags: ["balance", "change"] },
  { id: "se-sail", kind: "proverb", text: "Don't complain about lack of wind – learn to sail.", translation: { ko: "바람이 없다고 불평하지 말고, 돛 다루는 법을 배워라." }, attribution: "Swedish proverb · Klaga inte över för lite vind - lär dig segla", sourceUrl: "https://en.wikiquote.org/wiki/Swedish_proverbs", tags: ["setback", "skill", "change"] },
  { id: "se-never-late", kind: "proverb", text: "It is never too late.", translation: { ko: "너무 늦은 때란 없다." }, attribution: "Swedish proverb · Det är aldrig för sent", sourceUrl: "https://en.wikiquote.org/wiki/Swedish_proverbs", tags: ["gap"] },
  { id: "se-hoping", kind: "proverb", text: "Patience is the art of hoping.", translation: { ko: "인내는 희망하는 기술이다." }, attribution: "Swedish proverb · Tålamod är konsten att hoppas", sourceUrl: "https://en.wikiquote.org/wiki/Swedish_proverbs", tags: ["patience", "gap"] },
  { id: "se-mistakes", kind: "proverb", text: "One learns from mistakes.", translation: { ko: "사람은 실수에서 배운다." }, attribution: "Swedish proverb · Man lär sig av misstagen", sourceUrl: "https://en.wikiquote.org/wiki/Swedish_proverbs", tags: ["setback", "skill"] },
  { id: "se-practice", kind: "proverb", text: "Practice gives skill.", translation: { ko: "연습이 실력을 만든다." }, attribution: "Swedish proverb · Övning ger färdighet", sourceUrl: "https://en.wikiquote.org/wiki/Swedish_proverbs", tags: ["skill"] },
  { id: "fi-slowly", kind: "proverb", text: "Good comes slowly.", translation: { ko: "좋은 것은 천천히 온다." }, attribution: "Finnish proverb · Hiljaa hyvä tulee", sourceUrl: "https://en.wikiquote.org/wiki/Finnish_proverbs", tags: ["patience", "balance"] },
  { id: "fi-curves", kind: "proverb", text: "The journey has many curves.", translation: { ko: "여정에는 굽이가 많다." }, attribution: "Finnish proverb", sourceUrl: "https://en.wikiquote.org/wiki/Finnish_proverbs", tags: ["direction", "gap"] },
  { id: "ie-third", kind: "proverb", text: "It is a third of the work to begin.", translation: { ko: "시작하는 것만으로 일의 3분의 1은 한 셈이다." }, attribution: "Irish proverb · Is trian de'n obair tús a chur", sourceUrl: "https://en.wikiquote.org/wiki/Irish_proverbs", tags: ["start"] },
  { id: "ie-beginning-weak", kind: "proverb", text: "Every beginning is weak.", translation: { ko: "모든 시작은 서툴다." }, attribution: "Irish proverb · Bíonn gach tosú lag", sourceUrl: "https://en.wikiquote.org/wiki/Irish_proverbs", tags: ["start", "skill"] },
  { id: "mi-kumara", kind: "proverb", text: "The sweet potato does not speak of its own sweetness.", translation: { ko: "고구마는 자기 입으로 달다고 말하지 않는다." }, attribution: "Māori proverb · Kaore te kumara e korero mo tona ake reka", sourceUrl: "https://en.wikiquote.org/wiki/Maori_proverbs", tags: ["skill"] },
  { id: "in-pitcher", kind: "proverb", text: "It takes drop by drop to fill a pitcher.", translation: { ko: "한 방울 한 방울이 모여 물동이를 채운다." }, attribution: "Indian proverb", sourceUrl: "https://en.wikiquote.org/wiki/Indian_proverbs", tags: ["patience"] },
  { id: "cz-roses", kind: "proverb", text: "Patience brings roses.", translation: { ko: "인내는 장미를 가져온다." }, attribution: "Czech proverb · Trpělivost růže přináší", sourceUrl: "https://en.wikiquote.org/wiki/Czech_proverbs", tags: ["patience"] },
  // </pool>
];

export const QUOTE_TAGS: readonly QuoteTag[] = ["start", "setback", "skill", "change", "together", "gap", "patience", "direction", "courage", "balance"];

// ── 고민 분석 ─────────────────────────────────────────
// 한국어는 어간 위주, 영어는 소문자 부분 문자열로 비교한다.
const CONCERN_KEYWORDS: Record<QuoteTag, readonly string[]> = {
  setback: [
    "불합격", "탈락", "떨어", "낙방", "거절", "실패", "좌절", "광탈", "서류에서", "연락이 없", "연락이 안", "안 붙", "못 붙", "번번이",
    "reject", "fail", "setback", "turned down", "no response", "ghosted", "didn't get", "not selected",
  ],
  gap: [
    "공백", "경력 단절", "경단", "쉬었", "쉬고 있", "휴직", "육아", "출산", "복귀", "재취업", "다시 일", "재도전", "자신감", "늦은", "늦었", "뒤처", "나이가 많", "나이 때문",
    "gap", "career break", "time off", "return to work", "returning", "re-enter", "restart", "confidence", "too old", "behind", "comeback",
  ],
  change: [
    "이직", "전환", "전직", "직무 변경", "직무를 바꾸", "새 직무", "새로운 직무", "커리어 변경", "바꾸고", "옮기", "다른 분야", "비전공", "업종",
    "switch", "change career", "career change", "changing career", "transition", "pivot", "new field", "move into", "different field",
  ],
  direction: [
    "막막", "방향", "모르겠", "뭘 해야", "무엇을 해야", "적성", "진로", "헷갈", "갈피", "선택", "어떤 일", "맞는 일", "하고 싶은 일",
    "direction", "lost", "unsure", "not sure", "don't know", "confused", "which path", "purpose", "what to do",
  ],
  skill: [
    "포트폴리오", "역량", "스킬", "기술", "자격증", "공부", "학습", "배우", "경험 부족", "경험이 없", "경험이 부족", "실력", "코딩", "프로젝트", "부족",
    "skill", "portfolio", "learn", "study", "experience", "certificat", "project", "practice", "coding",
  ],
  together: [
    "혼자", "네트워크", "네트워킹", "인맥", "멘토", "동료", "팀", "협업", "조언", "외롭", "물어볼", "도와줄", "주변에",
    "alone", "network", "mentor", "team", "collaborat", "peer", "lonely", "advice", "nobody to ask",
  ],
  courage: [
    "두렵", "두려", "무섭", "겁", "불안", "걱정", "용기", "자신이 없", "망설", "주저",
    "afraid", "fear", "scared", "anxious", "anxiety", "nervous", "worr", "courage", "hesitat",
  ],
  patience: [
    "오래", "조급", "느리", "언제쯤", "시간이 걸", "꾸준", "버티", "지지부진", "장기전", "몇 달", "몇 년",
    "slow", "taking long", "takes long", "patience", "impatient", "how long", "keep going", "months",
  ],
  balance: [
    "병행", "퇴근 후", "회사 다니면서", "일하면서", "시간이 없", "번아웃", "지쳤", "지쳐", "피곤", "야근", "바쁘", "여유가 없",
    "burnout", "burned out", "burnt out", "exhausted", "tired", "no time", "while working", "balance", "overtime", "busy",
  ],
  start: [
    "처음", "첫 취업", "첫 직장", "첫 회사", "신입", "시작", "졸업", "사회초년생", "취준", "막 시작",
    "first job", "start", "begin", "graduat", "entry", "new grad", "junior",
  ],
};

const SKILL_ROLE = /개발|엔지니어|디자이너|분석|데이터|마케터|기획|연구|developer|engineer|designer|analyst|data|marketer|research/i;

function emptyWeights(): Record<QuoteTag, number> {
  return Object.fromEntries(QUOTE_TAGS.map((tag) => [tag, 0])) as Record<QuoteTag, number>;
}

/** 고민·상태·직무·나이를 태그별 가중치로 바꾼다. 고민 문장이 가장 강한 신호다. */
export function analyzeQuoteContext(input: Pick<QuoteInput, "age" | "concern" | "role" | "status">): Record<QuoteTag, number> {
  const weights = emptyWeights();
  const concern = (input.concern || "").toLowerCase();
  let concernHits = 0;
  for (const tag of QUOTE_TAGS) {
    const hits = CONCERN_KEYWORDS[tag].filter((word) => concern.includes(word)).length;
    if (hits > 0) {
      weights[tag] += 4 + Math.min(hits - 1, 2);
      concernHits += 1;
    }
  }

  const status = (input.status || "").toLowerCase();
  if (/재취업|복귀|경력 단절|return|re-?enter|career break/.test(status)) {
    weights.gap += 3;
    weights.courage += 1;
    weights.start += 1;
  } else if (/재직|이직|employed|working|currently/.test(status)) {
    weights.change += 2;
    weights.balance += 2;
    weights.direction += 1;
  } else if (/취업 준비|구직|취준|학생|졸업|job ?seek|looking|student|graduat|unemployed/.test(status)) {
    weights.start += 2;
    weights.skill += 1;
    weights.patience += 1;
  }

  if (SKILL_ROLE.test(input.role || "")) weights.skill += 1;
  if (Number.isFinite(input.age)) {
    if (input.age < 28) weights.start += 1;
    if (input.age >= 40) {
      weights.gap += 1;
      weights.change += 1;
    }
  }

  // 고민에서 아무 신호가 없으면 방향·시작을 기본값으로 둔다.
  if (concernHits === 0) {
    weights.direction += 2;
    weights.start += 1;
  }
  return weights;
}

// ── 선택 ─────────────────────────────────────────────
const TOP_CANDIDATES = 8;

function scoreItem(item: QuotePoolItem, weights: Record<QuoteTag, number>): number {
  // 첫 태그가 그 문장의 중심 주제이므로 조금 더 무겁게 본다.
  return item.tags.reduce((sum, tag, index) => sum + weights[tag] * (index === 0 ? 1 : 0.75), 0);
}

function pickWeighted<T>(entries: readonly { value: T; weight: number }[], random: () => number): T {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  const roll = Math.min(Math.max(random(), 0), 0.999999) * total;
  let acc = 0;
  for (const entry of entries) {
    acc += entry.weight;
    if (roll < acc) return entry.value;
  }
  return entries[entries.length - 1].value;
}

function selectItem(kind: QuotePoolItem["kind"], input: QuoteInput): { item: QuotePoolItem; weights: Record<QuoteTag, number> } {
  const random = input.random ?? Math.random;
  const weights = analyzeQuoteContext(input);
  const ofKind = QUOTE_POOL.filter((item) => item.kind === kind);
  const excluded = new Set((input.exclude ?? []).filter((id) => typeof id === "string"));
  // 최근에 본 문장을 빼되, 모두 빠지면 전체에서 다시 고른다.
  const fresh = ofKind.filter((item) => !excluded.has(item.id));
  const pool = fresh.length > 0 ? fresh : ofKind;
  const ranked = pool
    .map((item) => ({ item, score: scoreItem(item, weights) }))
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
  const positive = ranked.filter((entry) => entry.score > 0);
  const top = (positive.length > 0 ? positive : ranked).slice(0, TOP_CANDIDATES);
  const item = pickWeighted(top.map((entry) => ({ value: entry.item, weight: Math.max(entry.score, 0.5) ** 2 })), random);
  return { item, weights };
}

function toCareerQuote(item: QuotePoolItem, language: QuoteInput["language"]): CareerQuote {
  return {
    id: item.id,
    text: item.text,
    ...(language === "ko" ? { translation: item.translation.ko } : {}),
    attribution: item.attribution,
    sourceUrl: item.sourceUrl,
  };
}

// ── 연결 문장 ─────────────────────────────────────────
// {role} 뒤에 조사가 붙지 않도록 문장을 짠다. 격언을 오늘 할 수 있는 행동으로 바꾸는 것이 목적이다.
const CONNECTIONS: Record<QuoteTag, { ko: readonly string[]; en: readonly string[] }> = {
  setback: {
    ko: [
      "지난 {role} 지원에서 배운 점 한 가지를 적고, 다음 지원서에 바로 반영해 보세요.",
      "떨어진 공고 하나를 다시 열어 {role} 요건과 내 서류의 차이를 세 줄로 정리해 보세요.",
      "이번 주에 {role} 공고 한 곳에 다시 지원하고, 이전과 다르게 한 점 하나를 기록해 두세요.",
    ],
    en: [
      "Write down one lesson from your last {role} application and use it in the next one.",
      "Reopen one posting that turned you down and list three gaps between it and your {role} resume.",
      "Send one more {role} application this week and note one thing you did differently.",
    ],
  },
  gap: {
    ko: [
      "쉬는 동안 해 온 일 중 {role} 업무와 이어지는 경험 하나를 한 문장으로 정리해 보세요.",
      "오늘 {role} 관련 짧은 강의나 과제 하나를 시작해, 공백을 '준비한 시간'으로 바꿔 보세요.",
      "{role} 자리로 돌아간 사람 한 명의 경로를 찾아보고, 내가 따라 할 첫 단계를 골라 보세요.",
    ],
    en: [
      "Sum up one experience from your time away that connects to {role} work in a single sentence.",
      "Start one short {role} course or task today so the gap reads as preparation.",
      "Find one person who returned to a {role} job and pick the first step of their path you can copy.",
    ],
  },
  change: {
    ko: [
      "지금까지의 성과 중 {role} 직무에도 통하는 강점 하나를 골라 이력서 첫 줄에 올려 보세요.",
      "현직 {role} 한 명의 하루를 조사해, 내가 이미 해 본 업무와 겹치는 부분을 표시해 보세요.",
      "{role} 공고 세 개를 비교해, 공통 요구 역량 중 이미 가진 것부터 정리해 보세요.",
    ],
    en: [
      "Pick one achievement that carries over to {role} work and put it at the top of your resume.",
      "Research a typical day for a {role} and mark the tasks you have already done.",
      "Compare three {role} postings and list the shared requirements you already meet.",
    ],
  },
  direction: {
    ko: [
      "{role} 공고 세 개에서 반복되는 업무를 모아, 끌리는 일과 아닌 일을 두 칸으로 나눠 보세요.",
      "이번 주에 현직 {role} 한 명에게 '가장 보람 있던 순간'을 묻고, 내 기준과 비교해 보세요.",
      "{role} 목표를 '3개월 뒤 내가 할 수 있게 될 일' 한 문장으로 적어 보세요.",
    ],
    en: [
      "Collect the recurring tasks in three {role} postings and sort them into ones that draw you and ones that don't.",
      "Ask one working {role} this week about their most rewarding moment and compare it with what you want.",
      "Write your {role} goal as one sentence about what you will be able to do in three months.",
    ],
  },
  skill: {
    ko: [
      "{role} 핵심 역량 하나를 골라 이번 주 안에 눈에 보이는 결과물 하나로 보여 주세요.",
      "{role} 실무에서 자주 쓰는 도구 하나로 작은 프로젝트를 만들어 포트폴리오에 더해 보세요.",
      "매일 30분씩 {role} 역량 하나를 연습하고, 일주일 뒤 달라진 점을 기록해 보세요.",
    ],
    en: [
      "Choose one core {role} skill and show it as one visible piece of work this week.",
      "Build a small project with one tool {role} teams use every day and add it to your portfolio.",
      "Practice one {role} skill for 30 minutes a day and note what changed after a week.",
    ],
  },
  together: {
    ko: [
      "{role} 준비에서 막힌 부분 하나를 정리해, 이번 주에 한 사람에게 피드백을 구해 보세요.",
      "{role} 직무 커뮤니티나 스터디 한 곳에 들어가 내 질문 하나를 올려 보세요.",
      "현직 {role} 한 명에게 짧은 커피챗을 요청하고, 물어볼 질문 세 가지를 준비해 보세요.",
    ],
    en: [
      "Name one place your {role} preparation is stuck and ask one person for feedback this week.",
      "Join one {role} community or study group and post one question of your own.",
      "Ask a working {role} for a short coffee chat and prepare three questions.",
    ],
  },
  courage: {
    ko: [
      "미뤄 두었던 {role} 공고 하나에 오늘 지원 버튼을 눌러 보세요.",
      "{role} 준비에서 가장 두려운 일 하나를 적고, 10분 안에 할 수 있는 크기로 쪼개 보세요.",
      "{role} 면접에서 받을까 걱정되는 질문 하나에 대한 답을 소리 내어 연습해 보세요.",
    ],
    en: [
      "Press apply today on one {role} posting you have been putting off.",
      "Write down the scariest part of your {role} search and break it into a ten-minute task.",
      "Practice out loud your answer to the {role} interview question you fear most.",
    ],
  },
  patience: {
    ko: [
      "{role} 준비를 12주 계획으로 나누고, 이번 주에 할 한 칸만 먼저 채워 보세요.",
      "매주 같은 요일에 {role} 준비 기록을 한 줄씩 남겨, 쌓여 가는 과정을 눈으로 확인해 보세요.",
      "{role} 목표까지 남은 단계를 적고, 오늘 끝낼 수 있는 가장 작은 단계 하나를 해 보세요.",
    ],
    en: [
      "Split your {role} preparation into a 12-week plan and fill in just this week's box.",
      "Log one line of {role} progress on the same day every week so you can see it add up.",
      "List the steps left to your {role} goal and finish the smallest one today.",
    ],
  },
  balance: {
    ko: [
      "퇴근 후 {role} 준비는 주 3회 30분으로 정하고, 나머지 저녁은 쉬는 시간으로 지켜 보세요.",
      "이번 주 {role} 준비 목록에서 가장 중요한 한 가지만 남기고 나머지는 다음 주로 넘겨 보세요.",
      "지금 일을 유지하면서 {role} 준비를 이어 가도록, 주말 중 반나절만 고정해 보세요.",
    ],
    en: [
      "Cap after-work {role} preparation at three 30-minute sessions a week and protect the other evenings.",
      "Keep only the single most important item on this week's {role} list and move the rest to next week.",
      "Reserve one fixed half-day each weekend for {role} preparation so your current job stays steady.",
    ],
  },
  start: {
    ko: [
      "오늘 {role} 공고 하나를 골라 필요한 역량 세 가지를 적는 것으로 시작해 보세요.",
      "{role} 관련 첫 결과물을 완벽하지 않아도 이번 주 안에 하나 완성해 보세요.",
      "{role} 준비 첫 주에 할 일 세 가지를 정하고, 그중 하나를 오늘 끝내 보세요.",
    ],
    en: [
      "Start today by picking one {role} posting and writing down the three skills it asks for.",
      "Finish one first {role} piece of work this week, even if it isn't perfect.",
      "Set three tasks for your first week of {role} preparation and finish one today.",
    ],
  },
};

function connectionTag(item: QuotePoolItem, weights: Record<QuoteTag, number>): QuoteTag {
  // 문장이 가진 태그 중 사용자 고민과 가장 강하게 맞닿은 태그를 쓴다.
  return item.tags.reduce((best, tag) => (weights[tag] > weights[best] ? tag : best), item.tags[0]);
}

export function buildConnection(tag: QuoteTag, role: string, language: QuoteInput["language"], random: () => number = Math.random): string {
  const fallbackRole = language === "en" ? "your target role" : "희망 직무";
  const cleanRole = (role || "").trim() || fallbackRole;
  const templates = CONNECTIONS[tag][language];
  const index = Math.min(Math.floor(Math.min(Math.max(random(), 0), 0.999999) * templates.length), templates.length - 1);
  return templates[index].replaceAll("{role}", cleanRole);
}

/** 명언(quote): 고민과 연결된 인물의 문장. */
export function selectCareerMotivation(input: QuoteInput): CareerQuote {
  const { item } = selectItem("quote", input);
  return toCareerQuote(item, input.language);
}

/** 격언(proverb): 세계 각지의 속담 + 오늘 할 행동으로 바꾼 연결 문장. */
export function selectCareerQuote(input: QuoteInput): CareerQuote {
  const random = input.random ?? Math.random;
  const { item, weights } = selectItem("proverb", { ...input, random });
  return { ...toCareerQuote(item, input.language), connection: buildConnection(connectionTag(item, weights), input.role, input.language, random) };
}
