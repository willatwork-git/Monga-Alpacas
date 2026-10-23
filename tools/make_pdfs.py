#!/usr/bin/env python3
"""Rebuild the branded PDF copies of Bob's articles.

The web articles in website/articles/*.html are the source of truth. Edit those,
then run this script to regenerate website/articles/pdf/<slug>.pdf.

Titles, dates and summaries are read from website/articles.html (the article library).
Bylines come from tools/article-bylines.json.

Setup (once):  pip3 install playwright && python3 -m playwright install chromium
Run:           python3 tools/make_pdfs.py            (all articles)
               python3 tools/make_pdfs.py beware-of-the-cv   (one article)
"""
import html, json, re, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "website"
TPL = (ROOT / "tools" / "pdf-template.html").read_text()
BYLINES = json.loads((ROOT / "tools" / "article-bylines.json").read_text())
SHEET = '''<div class="table-wrap"><table><caption>Excel spreadsheet for calculating number of fibres (N)</caption>
<thead><tr><th>Property</th><th>Alpaca</th><th>FD µ</th><th>SD µ</th><th>SL mm</th><th>WT kg</th><th>N×10⁶</th><th>Density score</th></tr></thead>
<tbody><tr><td></td><td>Test</td><td>20</td><td>4</td><td>90</td><td>2.5</td><td>66</td><td>10</td></tr></tbody></table></div>'''
FOOT = ('<div style="width:100%;font:7.5pt Georgia,serif;color:#5a6663;padding:0 20mm;display:flex;'
        'justify-content:space-between"><span>Bob Kingwell · <i>TITLE</i></span>'
        '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>')

def articles():
    index = (SITE / "articles.html").read_text()
    for m in re.finditer(r'<a class="lib-item" href="articles/pdf/[^"]+" data-article="([^"]+)"(?: data-date="([^"]*)")? data-summary="([^"]*)"><span class="t">([^<]+)</span>', index):
        slug, date, summary, title = m.groups()
        yield slug, html.unescape(title), date or "", html.unescape(summary)

def number(body):
    figs = re.findall(r"<figcaption>(.*?)</figcaption>", body)
    if figs and not any(f.startswith("Figure") for f in figs):
        n = iter(range(1, 99)); body = re.sub(r"<figcaption>", lambda m: f"<figcaption><b>Figure {next(n)}.</b> ", body)
    else:
        body = re.sub(r"<figcaption>(Figure \d+\.)", r"<figcaption><b>\1</b>", body)
    caps = re.findall(r"<caption>(.*?)</caption>", body)
    if caps and not any(c.startswith("Table") for c in caps):
        n = iter(range(1, 99)); body = re.sub(r"<caption>", lambda m: f"<caption>Table {next(n)}. ", body)
    return body

def main(only):
    tmp = ROOT / "tools" / ".pdf-build"; tmp.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(); page = browser.new_page()
        for slug, title, date, summary in articles():
            if only and slug not in only: continue
            body = (SITE / "articles" / f"{slug}.html").read_text()
            body = re.sub(r'<form class="calc".*?</form>', SHEET, body, flags=re.S)
            body = body.replace('src="articles/img/', f'src="{(SITE / "articles" / "img").as_uri()}/')
            body = re.sub(r'<span class="sr-only">.*?</span>', "", number(body))
            doc = (TPL.replace("{{FONTS}}", (SITE / "fonts").as_uri() + "/")
                      .replace("{{TITLE}}", html.escape(title)).replace("{{BYLINE}}", BYLINES.get(slug, {}).get("byline", "Bob Kingwell"))
                      .replace("{{DATE}}", date).replace("{{DATECLASS}}", "" if date else "nodate")
                      .replace("{{SUMMARY}}", html.escape(summary)).replace("{{BODY}}", body))
            f = tmp / f"{slug}.html"; f.write_text(doc)
            page.goto(f.as_uri(), wait_until="networkidle"); page.evaluate("document.fonts.ready")
            out = SITE / "articles" / "pdf" / f"{slug}.pdf"
            page.pdf(path=str(out), format="A4", print_background=True, display_header_footer=True,
                     header_template="<div></div>", footer_template=FOOT.replace("TITLE", html.escape(title)),
                     margin={"top": "18mm", "bottom": "20mm", "left": "20mm", "right": "20mm"})
            print("wrote", out.relative_to(ROOT))
        browser.close()

if __name__ == "__main__":
    main(sys.argv[1:])
