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
| `quiz-map.pdf` | The whole quiz as one diagram, linked from the intro screen |

To edit the quiz, change `data.js`: `data` holds the questions (each `yes`/`no` points to the next question or a result name), and `results` holds each result's image, colour and text.

## Quiz map

`quiz-map.pdf` is generated from `data.js`, so after changing the quiz, rebuild it and commit the new PDF:

```bash
node scripts/build-map.js
```

CI runs `node scripts/build-map.js --check` and fails if the committed PDF no longer matches `data.js`.
