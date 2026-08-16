# Which cosmic object are you?

A short yes/no quiz that matches you with one of 32 cosmic objects — from Phobos to a black hole — and tells you a bit about it.

**Play it:** https://susanna-bekker.github.io/which-cosmic-object-are-you/

Made for NI Festival 2026.

## Run locally

No build step — just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server
```

## Files

| File | What's in it |
| --- | --- |
| `index.html` | Page structure |
| `style.css` | Styles |
| `script.js` | Quiz logic and animations |
| `data.js` | Questions, answers and result descriptions |
| `pictures/` | Result images |
| `map.html`, `map.css`, `map.js` | The quiz map page |
| `map-layout.js` | Where everything sits on the map |
| `pictures/map/` | Small copies of the images, for the map |

To edit the quiz, change `data.js`: `data` holds the questions (each `yes`/`no` points to the next question or a result name), and `results` holds each result's image, colour and text.

## The quiz map

`map.html` is the whole quiz on one canvas — every question, both answers and all 32 results — which you can drag around and zoom into instead of answering question by question. The intro screen links to it.

The page holds no content of its own: the questions and descriptions are read from `data.js`, the pictures come from `pictures/`, and `map-layout.js` only says where each one goes and how the arrows curve. So editing `data.js` changes the map too, and `node scripts/check-map.js` (also run by CI) fails if a question or result has no place on the map.

Two one-off tools rebuild the parts that cannot come from `data.js`. They need Python and are not part of CI:

```bash
pip install pymupdf pillow
python3 scripts/extract-layout.py     # map-layout.js, from the printed poster
python3 scripts/make-map-assets.py    # pictures/map/, small copies of the images
```

`extract-layout.py` reads `docs/poster.pdf`, which is not in the repository because it is ~50 MB — you only need it if the poster's layout changes. `make-map-assets.py` shrinks `pictures/` (over 120 MB of 2048px PNGs) into ~2.6 MB of WebP, since the map shows all 32 objects at once; the full-size PNG is still loaded when you zoom right into an object.
