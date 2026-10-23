# Monga Alpacas website

The rebuild of [mongaalpacas.com](https://www.mongaalpacas.com/) for Bob Kingwell's Huacaya stud at Monga, near Braidwood NSW. It replaces the old Wix site with plain HTML/CSS that can be hosted anywhere.

**Status (23 Oct 2026):** preview ready for Bob's review on GitHub Pages. Not yet live.

## Folders
| Folder | What it is |
|---|---|
| `website/` | **The site.** Everything that gets published. Open `index.html`. |
| `website/articles.html`, `website/articles/` | Bob's article library, the 11 articles as web fragments (source of truth), their figures and the branded PDFs |
| `website/gallery.html`, `website/gallery/` | 40 photos (`full/` up to 1800 px, `thumb/` 720 px) |
| `website/preview.js`, `website/bob.html`, `website/bob/` | Preview only: banner with Comments switch, section labels, feedback button, Bob's guide. Remove at launch. |
| `tools/` | `make_pdfs.py` rebuilds the article PDFs from the web articles |
| `.github/workflows/pages.yml` | Publishes `website/` to GitHub Pages on every push to `main` |
| `design/` | Not in git. Project notes, change log, reviews, research and source files. |

## Preview locally
```sh
python3 -m http.server 8766 --bind 127.0.0.1 --directory website
```
Open http://127.0.0.1:8766/ (the article reader needs a web server; opening the file directly won't load articles).

## Common edits
- **Text on the home page:** `website/index.html`.
- **Article text:** `website/articles/<slug>.html`, then rebuild PDFs (below). Do not change Bob's wording without his approval.
- **Article summaries / titles / dates:** the library in `website/articles.html` (`data-summary`, `data-date`). The three featured on the home page are in `website/index.html`.
- **Show record:** the table in the `#honours` section of `website/index.html`. Every row needs a source link.
- **Gallery:** `website/gallery.html` (one `<li class="tile">` per photo) and the image files in `website/gallery/`.
- **Styles:** `website/site.css`.

## Rebuild article PDFs
```sh
pip3 install playwright && python3 -m playwright install chromium   # once
python3 tools/make_pdfs.py                                          # all
python3 tools/make_pdfs.py beware-of-the-cv                         # one
```

## Publish
Push to `main` on GitHub; the workflow publishes `website/`. First-time setup: create a public repo, push, then Settings → Pages → Source: GitHub Actions. Launch steps (removing preview extras, moving the domain) are in the project notes.

## Credits
Text and articles © Bob Kingwell / Monga Alpacas. Photographs from Monga Alpacas. Fonts: Barlow Condensed and Source Serif 4 (SIL Open Font License, licences in `website/fonts/`).
