"""
Reads the printed poster and writes map-layout.js: where every question box,
object picture, heading and arrow sits, in poster units.

Only geometry is taken from the PDF. Every word on the map page comes from
data.js and every picture from pictures/, so the map cannot drift from the quiz.

    pip install pymupdf
    python3 scripts/extract-layout.py

Needs docs/poster.pdf, which is not in the repository (it is ~50 MB). This is a
one-off tool: rerun it only if the poster's layout changes.
"""

import json
import math
import os
import re
import subprocess
import sys

import pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "docs", "poster.pdf")
OUT = os.path.join(ROOT, "map-layout.js")

QUESTION_BLUE = (0.75, 0.95, 1.0)       # рамка вопроса
GREEN = (0.26, 1.0, 0.56)               # стрелка YES
RED = (1.0, 0.41, 0.41)                 # стрелка NO
BACKGROUND_XREF = 256

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
r2 = lambda v: round(v, 1)
ri = lambda v: round(v)


def load_quiz():
    """data.js is a plain browser script, so node reads it back out for us."""
    js = (
        'const vm=require("vm"),fs=require("fs");'
        f'const s=fs.readFileSync({json.dumps(os.path.join(ROOT, "data.js"))},"utf8");'
        'const {data,results}=vm.runInNewContext(s+";({data,results});");'
        "console.log(JSON.stringify({data,results}))"
    )
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True)
    quiz = json.loads(out.stdout)
    return quiz["data"], quiz["results"]


questions, results = load_quiz()
page = pymupdf.open(PDF)[0]
drawings = page.get_drawings()
blocks = [b for b in page.get_text("dict")["blocks"] if b["type"] == 0]
problems = []


def block_text(b):
    return " ".join(s["text"] for l in b["lines"] for s in l["spans"])


def block_size(b):
    return max(s["size"] for l in b["lines"] for s in l["spans"])


def lead(lines):
    """Distance from one line's top to the next: what CSS calls line-height."""
    if len(lines) > 1:
        return r2(lines[1]["bbox"][1] - lines[0]["bbox"][1])
    span = lines[0]["spans"][0]
    return r2((span["ascender"] - span["descender"]) * span["size"])


def fill(drawing):
    return tuple(round(c, 2) for c in drawing["fill"]) if drawing["fill"] else None


def hex_fill(drawing):
    return "#%02X%02X%02X" % tuple(round(c * 255) for c in drawing["fill"])


# ---------- questions ----------

# The poster's text blocks split and merge unpredictably, so each question is
# read out of its own dotted box instead: one box holds exactly one question.
blue = [d for d in drawings if fill(d) == QUESTION_BLUE]
# every box is drawn twice: the dotted border, and the letters inside it
borders = [a for a in blue
           if any(a["rect"].contains(b["rect"]) and a["rect"] != b["rect"] for b in blue)]

lines = [l for b in blocks for l in b["lines"]]
by_text = {norm(q["text"]): qid for qid, q in questions.items()}

question_out = {}
for box in borders:
    r = box["rect"]
    inside = [l for l in lines if r.contains(pymupdf.Rect(l["bbox"]))]
    inside.sort(key=lambda l: (round(l["bbox"][1]), l["bbox"][0]))
    text = " ".join(s["text"] for l in inside for s in l["spans"])
    qid = by_text.get(norm(text))
    if qid is None:
        problems.append(f"a box holds text that is in no question: {text[:60]!r}")
        continue
    # the text is inset from the dotted border; keep that padding
    left = min(l["bbox"][0] for l in inside)
    right = max(l["bbox"][2] for l in inside)
    question_out[qid] = {
        "box": [r2(r.x0), r2(r.y0), r2(r.x1 - r.x0), r2(r.y1 - r.y0)],
        "text": [r2(left), r2(inside[0]["bbox"][1]), r2(right - left)],
        "size": r2(max(s["size"] for l in inside for s in l["spans"])),
        "lead": lead(inside),
    }

missing = set(questions) - set(question_out)
if missing:
    problems.append(f"questions not found on the poster: {sorted(missing)}")

# ---------- results ----------

title_blocks = {}
for b in blocks:
    for name in results:
        if norm(block_text(b)) == norm(name):
            title_blocks[name] = b

missing = set(results) - set(title_blocks)
if missing:
    problems.append(f"result headings not found on the poster: {sorted(missing)}")

# body paragraphs are matched by their own words, so they cannot be mis-assigned
paragraph_owner = {}
for name, result in results.items():
    for i, paragraph in enumerate(result["text"].split("\n\n")):
        paragraph_owner[norm(paragraph)[:60]] = (name, i)

bodies = {}
for b in blocks:
    owner = paragraph_owner.get(norm(block_text(b))[:60])
    if owner:
        bodies.setdefault(owner[0], []).append((owner[1], b))

# pictures: the transform places the whole picture, bbox only its visible part
pictures = []
for image in page.get_image_info(xrefs=True):
    if image["xref"] in (0, BACKGROUND_XREF):
        continue
    rect = pymupdf.Rect(0, 0, 1, 1) * pymupdf.Matrix(image["transform"])
    rect.normalize()
    pictures.append(rect if not rect.is_empty else pymupdf.Rect(image["bbox"]))

# closest pair first, one picture per result: matching each picture to its
# nearest heading on its own puts two pictures on one result and none on another
pairs = []
for i, rect in enumerate(pictures):
    cx, cy = (rect.x0 + rect.x1) / 2, (rect.y0 + rect.y1) / 2
    for name, b in title_blocks.items():
        pairs.append(((b["bbox"][0] - cx) ** 2 + (b["bbox"][1] - cy) ** 2, i, name))
pairs.sort()

picture_of, taken = {}, set()
for _, i, name in pairs:
    if name not in picture_of and i not in taken:
        picture_of[name] = pictures[i]
        taken.add(i)

# the line under a heading: thin, wide, and drawn with straight segments only
rules = [d for d in drawings
         if d["fill"] and all(item[0] == "l" for item in d["items"])
         and d["rect"].y1 - d["rect"].y0 < 12 and d["rect"].x1 - d["rect"].x0 > 200]

result_out = {}
for name, title in title_blocks.items():
    paragraphs = sorted(bodies.get(name, []))
    if len(paragraphs) != len(results[name]["text"].split("\n\n")):
        problems.append(f'result "{name}": {len(paragraphs)} paragraphs found on the poster')
        continue
    if name not in picture_of:
        problems.append(f'no picture matched to result "{name}"')
        continue

    first = paragraphs[0][1]
    rect = picture_of[name]
    entry = {
        "title": [r2(title["bbox"][0]), r2(title["lines"][0]["bbox"][1])],
        "titleSize": r2(block_size(title)),
        "titleLead": lead(title["lines"]),
        "body": [
            r2(first["bbox"][0]),
            r2(first["lines"][0]["bbox"][1]),
            r2(max(p[1]["bbox"][2] for p in paragraphs) - first["bbox"][0]),
        ],
        "bodySize": r2(block_size(first)),
        "image": [r2(rect.x0), r2(rect.y0), r2(rect.x1 - rect.x0), r2(rect.y1 - rect.y0)],
    }

    under = [d for d in rules
             if title["bbox"][1] < d["rect"].y0 < title["bbox"][3] + 40
             and abs(d["rect"].x0 - title["bbox"][0]) < 40]
    if not under:
        problems.append(f'no line found under the heading "{name}"')
    else:
        d = min(under, key=lambda d: d["rect"].y0)
        r = d["rect"]
        entry["rule"] = [r2(r.x0), r2(r.y0), r2(r.x1 - r.x0), r2(max(r.y1 - r.y0, 2))]
        entry["ruleColor"] = hex_fill(d)

    result_out[name] = entry

# every result's body is set with the same line spacing
leading = next(lead(paragraphs[0][1]["lines"])
               for paragraphs in bodies.values() if len(paragraphs[0][1]["lines"]) > 1)

# ---------- YES / NO, START HERE ----------

# Each label is stamped over its arrow as a small opaque picture, which is what
# breaks the line behind the word. We keep those rectangles so the map can cut
# the same gap out of the arrows.
stamps = {}
for image in page.get_image_info():
    b = image["bbox"]
    if image["width"] < 250 and image["height"] < 250:
        stamps[tuple(round(v) for v in b)] = b       # каждая нарисована дважды

labels = []
for b in blocks:
    key = norm(block_text(b))
    if key not in ("yes", "no", "yes1"):
        continue
    x0, y0, x1, y1 = b["bbox"]
    direction = b["lines"][0]["dir"]        # подписи повёрнуты вдоль стрелки
    label = {
        "t": "YES!" if key == "yes1" else key.upper(),
        "box": [r2(x0), r2(y0), r2(x1 - x0), r2(y1 - y0)],
        "size": r2(block_size(b)),
        "a": r2(math.degrees(math.atan2(direction[1], direction[0]))),
    }

    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    near = [s for s in stamps.values()
            if s[0] - 40 < cx < s[2] + 40 and s[1] - 40 < cy < s[3] + 40]
    if near:
        s = min(near, key=lambda s: ((s[0] + s[2]) / 2 - cx) ** 2 + ((s[1] + s[3]) / 2 - cy) ** 2)
        label["gap"] = [r2(s[0]), r2(s[1]), r2(s[2] - s[0]), r2(s[3] - s[1])]
    else:
        problems.append(f"no gap in the arrow behind the {label['t']} at {round(x0)},{round(y0)}")
    labels.append(label)

start = None
for b in blocks:
    if norm(block_text(b)) == "starthere":
        start = {
            "at": [r2(b["bbox"][0]), r2(b["lines"][0]["bbox"][1])],
            "size": r2(block_size(b)),
            "lead": lead(b["lines"]),
        }
if start is None:
    problems.append("START HERE not found on the poster")

# ---------- arrows ----------


def path_data(drawing):
    """The arrow outline as an SVG path, at whole-unit precision."""
    parts, here = [], None
    for item in drawing["items"]:
        kind = item[0]
        if kind in ("l", "c"):
            points = item[1:]
            start_point = points[0]
            if here is None or abs(start_point.x - here.x) > 0.05 or abs(start_point.y - here.y) > 0.05:
                parts.append(f"M{ri(start_point.x)} {ri(start_point.y)}")
            if kind == "l":
                parts.append(f"L{ri(points[1].x)} {ri(points[1].y)}")
            else:
                parts.append("C" + " ".join(f"{ri(p.x)} {ri(p.y)}" for p in points[1:]))
            here = points[-1]
        elif kind == "re":
            r = item[1]
            parts.append(f"M{ri(r.x0)} {ri(r.y0)}H{ri(r.x1)}V{ri(r.y1)}H{ri(r.x0)}Z")
            here = None
        elif kind == "qu":
            q = item[1]
            parts.append("M" + " L".join(f"{ri(p.x)} {ri(p.y)}" for p in (q.ul, q.ur, q.lr, q.ll)) + "Z")
            here = None
    return "".join(parts) + "Z"


arrows = [{"c": "y" if fill(d) == GREEN else "n", "d": path_data(d)}
          for d in drawings if fill(d) in (GREEN, RED)]

# ---------- write ----------

if problems:
    print("Problems:")
    for problem in problems:
        print("  -", problem)
    sys.exit(1)

# the map starts below the poster's printed header, which the page does not draw
top = min([q["box"][1] for q in question_out.values()]
          + [r["image"][1] for r in result_out.values()]
          + [r["title"][1] for r in result_out.values()])

layout = {
    "world": [r2(page.rect.width), r2(page.rect.height)],
    "top": r2(top - 60),
    "leading": leading,
    "results": result_out,
    "questions": question_out,
    "labels": labels,
    "start": start,
    "arrows": arrows,
}

with open(OUT, "w") as fh:
    fh.write(
        "/* Where everything sits on the map, in poster units. Generated from\n"
        " * docs/poster.pdf by scripts/extract-layout.py - positions only: the\n"
        " * words come from data.js and the pictures from pictures/. */\n"
        f"const mapLayout = {json.dumps(layout, separators=(',', ':'))};\n"
    )

print(f"Wrote map-layout.js: {len(result_out)} results, {len(question_out)} questions, "
      f"{len(arrows)} arrow paths, {len(labels)} labels")
