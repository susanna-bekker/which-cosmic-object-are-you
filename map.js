/*
 * The whole quiz on one canvas: questions and results come from data.js and
 * pictures/, the positions and arrows come from map-layout.js (which was
 * measured off the printed poster). Everything is laid out in poster units and
 * scaled with a single transform, so panning and zooming is one cheap operation.
 */

const world = document.getElementById("world");
const sky = document.getElementById("sky");
const viewport = document.getElementById("viewport");
const hint = document.getElementById("hint");

const SVG_NS = "http://www.w3.org/2000/svg";
const [WORLD_W, WORLD_H] = mapLayout.world;
const LEADING = mapLayout.leading;          // расстояние между строками текста
const MAX_SCALE = 2.5;
const SKY_PARALLAX = 0.18;

world.style.width = `${WORLD_W}px`;
world.style.height = `${WORLD_H}px`;

/* ===== HELPERS ===== */

function place(node, [x, y, w, h]) {
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    if (w !== undefined) node.style.width = `${w}px`;
    if (h !== undefined) node.style.height = `${h}px`;
    return node;
}

// text sits at the top of its line box, with the line height the poster used:
// same fonts, same sizes, so the lines land where they do on the poster
function setText(node, text, size, leading) {
    node.textContent = text;
    node.style.fontSize = `${size}px`;
    node.style.lineHeight = `${leading}px`;
    return node;
}

function add(tag, className, parent = world) {
    const node = document.createElement(tag);
    node.className = className;
    parent.appendChild(node);
    return node;
}

/* ===== ARROWS ===== */

function svgNode(tag, attributes) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
}

const svg = svgNode("svg", {
    id: "arrows",
    viewBox: `0 0 ${WORLD_W} ${WORLD_H}`,
    width: WORLD_W,
    height: WORLD_H,
    "aria-hidden": "true",
});

// Every arrow breaks off around its YES/NO, the way the poster stamps the word
// over the line, so the gaps are cut out of the arrows and the sky shows through.
const mask = svgNode("mask", { id: "answer-gaps", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: WORLD_W, height: WORLD_H });
mask.appendChild(svgNode("rect", { x: 0, y: 0, width: WORLD_W, height: WORLD_H, fill: "#fff" }));
for (const label of mapLayout.labels) {
    if (!label.gap) continue;
    const [gx, gy, gw, gh] = label.gap;
    mask.appendChild(svgNode("rect", { x: gx, y: gy, width: gw, height: gh, fill: "#000" }));
}
const defs = svgNode("defs", {});
defs.appendChild(mask);
svg.appendChild(defs);

const arrows = svgNode("g", { mask: "url(#answer-gaps)" });
for (const arrow of mapLayout.arrows) {
    arrows.appendChild(svgNode("path", {
        d: arrow.d,
        class: arrow.c === "y" ? "arrow-yes" : "arrow-no",
    }));
}
svg.appendChild(arrows);
world.appendChild(svg);

/* ===== QUESTIONS ===== */

for (const [id, spot] of Object.entries(mapLayout.questions)) {
    const question = data[id];
    if (!question) continue;

    place(add("div", "question"), spot.box);
    const text = setText(add("div", "question-text"), question.text, spot.size, spot.lead);
    // a few units of slack, so a hair of rounding cannot break a line early
    const [left, top, width] = spot.text;
    place(text, [left - 3, top, width + 6]);
}

/* ===== START HERE ===== */

if (mapLayout.start) {
    const start = setText(add("div", "start-here"), "START HERE",
        mapLayout.start.size, mapLayout.start.lead);
    place(start, mapLayout.start.at);
}

/* ===== RESULTS ===== */

// "The Moon is Earth's only natural satellite" -> "The Moon" is set in bold,
// as are the "Phases:" style labels that open every later paragraph
function boldPrefix(paragraph, first) {
    const match = first
        ? paragraph.match(/^(.{1,70}?)\s(?:is|are|was|were)\s/)
        : paragraph.match(/^([^:]{1,40}:)/);
    return match ? match[1].length : 0;
}

function paragraph(text, first) {
    const node = document.createElement("p");
    const bold = boldPrefix(text, first);
    if (bold) {
        const strong = document.createElement("b");
        strong.textContent = text.slice(0, bold);
        node.appendChild(strong);
    }
    node.appendChild(document.createTextNode(text.slice(bold)));
    return node;
}

const upgradable = [];

for (const [name, spot] of Object.entries(mapLayout.results)) {
    const result = results[name];
    if (!result) continue;

    const image = add("img", "object");
    image.src = `pictures/map/${name}.webp`;
    image.alt = name;
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;        // иначе картинка уезжает вместо карты
    image.dataset.full = result.image;
    place(image, spot.image);
    upgradable.push(image);

    const title = setText(add("h2", "object-title"), name, spot.titleSize, spot.titleLead);
    title.style.color = result.color;
    place(title, spot.title);

    if (spot.rule) {
        const rule = place(add("div", "object-rule"), spot.rule);
        rule.style.background = spot.ruleColor || result.color;
    }

    const body = add("div", "object-text");
    body.style.fontSize = `${spot.bodySize}px`;
    body.style.lineHeight = `${LEADING}px`;
    const parts = result.text.split("\n\n");
    parts.forEach((part, i) => {
        const node = paragraph(part.trim(), i === 0);
        if (i < parts.length - 1) node.style.marginBottom = `${LEADING}px`;
        body.appendChild(node);
    });
    place(body, [spot.body[0], spot.body[1], spot.body[2]]);
}

/* ===== YES / NO =====
   Подписи повёрнуты вдоль своей стрелки, поэтому в разметке лежит только
   центр рамки, а наклон задаётся поворотом. */

for (const label of mapLayout.labels) {
    const node = add("div", `answer-label ${label.t === "NO" ? "no" : "yes"}`);
    node.textContent = label.t;
    node.style.fontSize = `${label.size}px`;
    const [x, y, w, h] = label.box;
    node.style.left = `${x + w / 2}px`;
    node.style.top = `${y + h / 2}px`;
    node.style.transform = `translate(-50%, -50%) rotate(${label.a}deg)`;
}

/* ===== VIEW ===== */

// the map only covers the part of the poster we redraw, so panning stops there
const bounds = (() => {
    let x0 = Infinity, y0 = mapLayout.top, x1 = -Infinity, y1 = -Infinity;
    const grow = (x, y, w, h) => {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x + w);
        y1 = Math.max(y1, y + h);
    };
    for (const spot of Object.values(mapLayout.questions)) grow(...spot.box);
    for (const spot of Object.values(mapLayout.results)) {
        grow(...spot.image);
        grow(spot.body[0], spot.body[1], spot.body[2], 0);
    }
    const pad = 120;
    return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
})();

let scale = 1;
let x = 0;
let y = 0;

const fitScale = () => Math.min(innerWidth / bounds.w, innerHeight / bounds.h);

function clamp() {
    const edge = 80;
    const minX = edge - (bounds.x + bounds.w) * scale;
    const maxX = innerWidth - edge - bounds.x * scale;
    const minY = edge - (bounds.y + bounds.h) * scale;
    const maxY = innerHeight - edge - bounds.y * scale;
    x = minX > maxX ? (minX + maxX) / 2 : Math.min(maxX, Math.max(minX, x));
    y = minY > maxY ? (minY + maxY) / 2 : Math.min(maxY, Math.max(minY, y));
}

function apply() {
    clamp();
    world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    // фон едет медленнее карты, но не дальше своего запаса по краям
    const limitX = innerWidth * 0.05;
    const limitY = innerHeight * 0.05;
    const skyX = Math.max(-limitX, Math.min(limitX, x * SKY_PARALLAX));
    const skyY = Math.max(-limitY, Math.min(limitY, y * SKY_PARALLAX));
    sky.style.transform = `translate3d(${skyX}px, ${skyY}px, 0)`;
    upgradeImages();
}

function zoomAt(factor, px, py) {
    const next = Math.min(MAX_SCALE, Math.max(fitScale(), scale * factor));
    if (next === scale) return;
    x = px - (px - x) * (next / scale);
    y = py - (py - y) * (next / scale);
    scale = next;
    apply();
}

function fit() {
    scale = fitScale();
    x = (innerWidth - bounds.w * scale) / 2 - bounds.x * scale;
    y = (innerHeight - bounds.h * scale) / 2 - bounds.y * scale;
    apply();
}

function centreOn([bx, by, bw, bh], on) {
    scale = on;
    x = innerWidth / 2 - (bx + bw / 2) * scale;
    y = innerHeight / 2 - (by + bh / 2) * scale;
    apply();
}

// The map opens where the quiz does: START HERE and the first question in the
// middle of the screen, close enough to read. "Fit" then shows the whole thing.
function openingView() {
    const first = mapLayout.questions.start;
    if (!first) {
        fit();
        return;
    }
    const [bx, by, bw, bh] = first.box;
    const start = mapLayout.start;
    const top = start ? Math.min(by, start.at[1]) : by;
    // the first question takes about a quarter of the screen: readable, with
    // both answers and a few objects around it still in view
    const wanted = (innerWidth * 0.27) / bw;
    const scale = Math.max(fitScale(), Math.min(0.42, Math.max(0.22, wanted)));
    centreOn([bx, top, bw, by + bh - top], scale);
}

/* ===== ЗАГРУЗКА КАРТИНОК =====
   Карта показывает уменьшенные копии из pictures/map/, а полноразмерный PNG
   подгружается только для того объекта, в который действительно всмотрелись. */

const THUMB_PX = 640;

function upgradeImages() {
    for (let i = upgradable.length - 1; i >= 0; i--) {
        const image = upgradable[i];
        const width = parseFloat(image.style.width) * scale;
        if (width < THUMB_PX) continue;
        const left = parseFloat(image.style.left) * scale + x;
        const top = parseFloat(image.style.top) * scale + y;
        const height = parseFloat(image.style.height) * scale;
        if (left > innerWidth || top > innerHeight || left + width < 0 || top + height < 0) continue;
        image.src = image.dataset.full;
        upgradable.splice(i, 1);
    }
}

/* ===== ЖЕСТЫ ===== */

const pointers = new Map();
let pinch = null;

viewport.addEventListener("dragstart", (event) => event.preventDefault());

viewport.addEventListener("pointerdown", (event) => {
    viewport.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    viewport.classList.add("dragging");
    hideHint();
});

viewport.addEventListener("pointermove", (event) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const current = { x: event.clientX, y: event.clientY };
    pointers.set(event.pointerId, current);

    if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        if (pinch) zoomAt(distance / pinch.distance, midX, midY);
        pinch = { distance, midX, midY };
        return;
    }

    x += current.x - previous.x;
    y += current.y - previous.y;
    apply();
});

function release(event) {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) viewport.classList.remove("dragging");
}

viewport.addEventListener("pointerup", release);
viewport.addEventListener("pointercancel", release);

viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const step = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    zoomAt(Math.exp(-step * 0.0015), event.clientX, event.clientY);
    hideHint();
}, { passive: false });

viewport.addEventListener("dblclick", (event) => {
    zoomAt(1.8, event.clientX, event.clientY);
});

document.getElementById("zoom-in").onclick = () => zoomAt(1.4, innerWidth / 2, innerHeight / 2);
document.getElementById("zoom-out").onclick = () => zoomAt(1 / 1.4, innerWidth / 2, innerHeight / 2);
document.getElementById("zoom-fit").onclick = fit;

document.addEventListener("keydown", (event) => {
    const step = 80;
    const keys = {
        ArrowLeft: () => { x += step; },
        ArrowRight: () => { x -= step; },
        ArrowUp: () => { y += step; },
        ArrowDown: () => { y -= step; },
        "+": () => zoomAt(1.4, innerWidth / 2, innerHeight / 2),
        "=": () => zoomAt(1.4, innerWidth / 2, innerHeight / 2),
        "-": () => zoomAt(1 / 1.4, innerWidth / 2, innerHeight / 2),
        "0": fit,
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
    apply();
    hideHint();
});

let hintTimer = setTimeout(hideHint, 6000);

function hideHint() {
    clearTimeout(hintTimer);
    hint.classList.add("hidden");
}

addEventListener("resize", () => {
    scale = Math.max(fitScale(), Math.min(MAX_SCALE, scale));
    apply();
});

openingView();
