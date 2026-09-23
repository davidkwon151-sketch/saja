"""Check the downloadable career quote pack without changing the app."""

import csv
import json
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse
from zipfile import ZipFile


PACK = Path(__file__).with_name("career-quotes-2026-09-23-v01")
SVG_NS = "{http://www.w3.org/2000/svg}"


class CareerQuotePackTest(unittest.TestCase):
    def test_pack(self):
        quotes = json.loads((PACK / "quotes.json").read_text(encoding="utf-8"))
        with (PACK / "quotes.csv").open(encoding="utf-8-sig", newline="") as file:
            rows = list(csv.DictReader(file))
        self.assertEqual(len(quotes), 6)
        self.assertEqual(rows, quotes)
        self.assertEqual(len({q["id"] for q in quotes}), 6)

        expected = {"README.md", "quotes.json", "quotes.csv"}
        for quote in quotes:
            image = quote["image"]
            expected.add(image)
            self.assertEqual(image, f'cards/{quote["id"]}.svg')
            self.assertEqual(urlparse(quote["sourceUrl"]).scheme, "https")
            self.assertTrue(urlparse(quote["sourceUrl"]).netloc)
            root = ET.parse(PACK / image).getroot()
            self.assertEqual(root.tag, SVG_NS + "svg")
            self.assertEqual(root.attrib["viewBox"], "0 0 1080 1080")
            self.assertIn(quote["text"], root.findtext(SVG_NS + "title"))
            texts = root.findall(SVG_NS + "text")
            self.assertEqual(
                " ".join(t.text for t in texts if t.attrib.get("class") == "quote"),
                quote["text"],
            )
            self.assertIn(quote["display_ko"], [t.text for t in texts])
            self.assertIn(quote["source_name"], root.findtext(SVG_NS + "desc"))

        actual = {p.relative_to(PACK).as_posix() for p in PACK.rglob("*") if p.is_file()}
        self.assertEqual(actual - {"build.py"}, expected)
        with ZipFile(PACK.with_suffix(".zip")) as archive:
            self.assertIsNone(archive.testzip())
            self.assertEqual(set(archive.namelist()), expected)
            for name in expected:
                self.assertEqual(archive.read(name), (PACK / name).read_bytes(), name)


if __name__ == "__main__":
    unittest.main()
