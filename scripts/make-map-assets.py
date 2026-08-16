"""
Builds pictures/map/: the small copies the map page loads.

pictures/ holds 2048px PNGs - fine for one result at a time, but the map shows
all 32 at once and that is over 120 MB. The map loads these WebP copies instead
and only fetches the original PNG when you zoom right into an object.

    pip install pillow
    python3 scripts/make-map-assets.py

Rerun it if pictures/ changes.
"""

import json
import os
import subprocess

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "pictures", "map")
OBJECT_PX = 640          # ровно 1:1 на карте в масштабе 100%
SKY_PX = 3508            # как исходник: фон не должен растягиваться на экране


def results():
    js = (
        'const vm=require("vm"),fs=require("fs");'
        f'const s=fs.readFileSync({json.dumps(os.path.join(ROOT, "data.js"))},"utf8");'
        'const {results}=vm.runInNewContext(s+";({results});");'
        "console.log(JSON.stringify(results))"
    )
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def shrink(source, longest, quality, destination):
    image = Image.open(source)
    scale = longest / max(image.size)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    image.resize(size, Image.LANCZOS).save(destination, quality=quality, method=6)
    return os.path.getsize(destination)


os.makedirs(OUT, exist_ok=True)
total = 0

for name, result in results().items():
    total += shrink(os.path.join(ROOT, result["image"]), OBJECT_PX, 72,
                    os.path.join(OUT, f"{name}.webp"))

sky = Image.open(os.path.join(ROOT, "pictures", "background.png")).convert("RGB")
sky.resize((SKY_PX, round(sky.height * SKY_PX / sky.width)), Image.LANCZOS).save(
    os.path.join(OUT, "sky.webp"), quality=82, method=6)
total += os.path.getsize(os.path.join(OUT, "sky.webp"))

print(f"Wrote {len(os.listdir(OUT))} files to pictures/map/, {total / 1024 / 1024:.1f} MB in total")
