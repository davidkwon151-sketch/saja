"""Create a small, source-linked quote pack using only Python's standard library."""

import csv
import json
from html import escape
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parent
QUOTES = [
    {
        "id": "start-ko", "theme": "도전", "text": "시작이 반이다.",
        "display_ko": "완벽한 준비보다 첫 지원 한 건이 길을 엽니다.",
        "attribution": "한국 속담", "source_name": "위키낱말사전",
        "sourceUrl": "https://ko.wiktionary.org/wiki/시작이_반이다",
        "image": "cards/start-ko.svg",
    },
    {
        "id": "recover-ko", "theme": "회복", "text": "비 온 뒤에 땅이 굳어진다.",
        "display_ko": "탈락의 경험도 다음 선택을 더 단단하게 만듭니다.",
        "attribution": "한국 속담", "source_name": "위키인용집",
        "sourceUrl": "https://ko.wikiquote.org/wiki/가나다순_한국_속담",
        "image": "cards/recover-ko.svg",
    },
    {
        "id": "together-ko", "theme": "연결", "text": "백지장도 맞들면 낫다.",
        "display_ko": "혼자 막히면 동료와 멘토에게 도움을 청해 보세요.",
        "attribution": "한국 속담", "source_name": "위키인용집",
        "sourceUrl": "https://ko.wikiquote.org/wiki/가나다순_한국_속담",
        "image": "cards/together-ko.svg",
    },
    {
        "id": "passion-en", "theme": "가슴 뛰는 일",
        "text": "Do what you love, and do it well - that's much more meaningful than any metric.",
        "display_ko": "마음이 가는 일을 찾고, 그 일을 잘할 방법을 익혀 보세요.",
        "attribution": "Kevin Systrom", "source_name": "BrainyQuote",
        "sourceUrl": "https://www.brainyquote.com/lists/authors/top-10-kevin-systrom-quotes",
        "image": "cards/passion-en.svg",
    },
    {
        "id": "courage-en", "theme": "용기",
        "text": "What would you do if you weren't afraid?",
        "display_ko": "두려움이 없다면 어떤 직무에 도전하고 싶으신가요?",
        "attribution": "Sheryl Sandberg", "source_name": "Goodreads Quotes",
        "sourceUrl": "https://www.goodreads.com/quotes/tag/career",
        "image": "cards/courage-en.svg",
    },
    {
        "id": "attitude-en", "theme": "전환",
        "text": "Take charge of your attitude. Don't let someone else choose it for you.",
        "display_ko": "남의 기준보다 내 선택의 방향을 먼저 살펴보세요.",
        "attribution": "Dale Carnegie (Goalcast 표기)", "source_name": "Goalcast",
        "sourceUrl": "https://www.goalcast.com/attitude-quotes/",
        "image": "cards/attitude-en.svg",
    },
]


def card(q):
    is_english = q["id"].endswith("en")
    words = q["text"].split()
    lines = []
    current = ""
    limit = 25 if is_english else 13
    for word in words:
        candidate = f"{current} {word}".strip()
        if len(candidate) > limit and current:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    font_size = 47 if is_english else 68
    line_height = 66 if is_english else 90
    start_y = 355 - (len(lines) - 1) * line_height // 2
    text_lines = "\n".join(
        f'<text x="92" y="{start_y + i * line_height}" class="quote">{escape(line)}</text>'
        for i, line in enumerate(lines)
    )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" role="img" aria-labelledby="title desc">
<title id="title">{escape(q["theme"])}: {escape(q["text"])}</title>
<desc id="desc">커리어 나침반 명언 카드. 출처: {escape(q["source_name"])}</desc>
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#fbf8ef"/><stop offset="1" stop-color="#eaf4e9"/></linearGradient></defs>
<style>.brand{{font:700 26px 'Malgun Gothic',sans-serif;letter-spacing:4px;fill:#236b70}}.tag{{font:700 27px 'Malgun Gothic',sans-serif;fill:#c65f43}}.quote{{font:700 {font_size}px 'Malgun Gothic',sans-serif;fill:#263a3a}}.detail{{font:400 29px 'Malgun Gothic',sans-serif;fill:#526767}}.source{{font:500 23px 'Malgun Gothic',sans-serif;fill:#526767}}</style>
<rect width="1080" height="1080" fill="url(#bg)"/>
<circle cx="914" cy="156" r="112" fill="none" stroke="#b8cec3" stroke-width="3"/>
<path d="M914 72v168M830 156h168" stroke="#b8cec3" stroke-width="2"/>
<path d="M914 102l15 54-15 54-15-54z" fill="#c65f43"/>
<text x="92" y="124" class="brand">✦ 커리어 나침반</text>
<text x="92" y="210" class="tag">{escape(q["theme"])}</text>
{text_lines}
<line x1="92" x2="988" y1="655" y2="655" stroke="#b8cec3" stroke-width="2"/>
<text x="92" y="732" class="detail">{escape(q["display_ko"])}</text>
<text x="92" y="935" class="source">{escape(q["attribution"])} · {escape(q["source_name"])}</text>
<text x="92" y="982" class="source">원문 주소는 함께 제공된 quotes.json에서 확인하세요.</text>
</svg>'''


def main():
    cards = ROOT / "cards"
    cards.mkdir(exist_ok=True)
    for q in QUOTES:
        (ROOT / q["image"]).write_text(card(q), encoding="utf-8")
    (ROOT / "quotes.json").write_text(json.dumps(QUOTES, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (ROOT / "quotes.csv").open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=QUOTES[0].keys())
        writer.writeheader()
        writer.writerows(QUOTES)
    with ZipFile(ROOT.with_suffix(".zip"), "w", ZIP_DEFLATED) as archive:
        for path in sorted(ROOT.rglob("*")):
            if path.is_file() and path.name != "build.py":
                archive.write(path, path.relative_to(ROOT))


if __name__ == "__main__":
    main()
