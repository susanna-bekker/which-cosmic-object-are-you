/*
 * Builds quiz-map.pdf: the whole quiz drawn as one left-to-right tree,
 * generated straight from data.js so the map can never drift from the quiz.
 *
 *   node scripts/build-map.js          # write quiz-map.pdf
 *   node scripts/build-map.js --check  # fail if the committed PDF is out of date
 *
 * No dependencies: the PDF is written by hand below (plain lines, rectangles
 * and Helvetica text), so the repo keeps its no-build-step setup.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const outFile = path.join(root, "quiz-map.pdf");

const source = fs.readFileSync(path.join(root, "data.js"), "utf8");
const { data, results } = vm.runInNewContext(`${source}\n;({ data, results });`);

/* ===== LAYOUT ===== */

const MARGIN = 40;
const HEADER = 92;          // title block above the tree
const ROW_H = 30;           // vertical space per result
const BOX_W = 200;          // question box
const GAP = 46;             // horizontal room for the connectors
const RESULT_W = 210;
const PAD = 7;

const Q_SIZE = 8.5;
const Q_LEAD = 10.5;
const R_SIZE = 10;
const LABEL_SIZE = 6.5;

const INK = [0.09, 0.13, 0.18];
const MUTED = [0.42, 0.47, 0.54];
const BOX_LINE = [0.72, 0.76, 0.82];
const YES = [0.12, 0.62, 0.34];
const NO = [0.82, 0.32, 0.30];
const YES_LINE = [0.45, 0.75, 0.57];
const NO_LINE = [0.89, 0.58, 0.56];

const hex = (value) => {
    const match = /^#?([0-9a-f]{6})$/i.exec(value || "");
    if (!match) return [0.6, 0.63, 0.68];
    const n = parseInt(match[1], 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const tint = (color) => color.map(c => c + (1 - c) * 0.87);

/* ===== TREE ===== */

// Each answer gets its own subtree, so a result reached from two branches is
// simply drawn twice instead of pulling the layout apart.
function build(id, ancestors) {
    const node = data[id];
    if (!node) return { kind: "result", id, children: [] };
    if (ancestors.includes(id)) return { kind: "loop", id, children: [] };
    const seen = ancestors.concat(id);
    return {
        kind: "question",
        id,
        text: node.text,
        children: [
            { answer: "yes", tree: build(node.yes, seen) },
            { answer: "no", tree: build(node.no, seen) },
        ],
    };
}

const tree = build("start", []);

let rows = 0;
let maxDepth = 0;
const nodes = [];

// leaves get a row each; a question sits level with the middle of its subtree
function place(node, depth) {
    node.depth = depth;
    maxDepth = Math.max(maxDepth, depth);
    nodes.push(node);
    if (!node.children.length) {
        node.y = HEADER + rows * ROW_H + ROW_H / 2;
        rows += 1;
        return;
    }
    for (const child of node.children) place(child.tree, depth + 1);
    const ys = node.children.map(child => child.tree.y);
    node.y = (Math.min(...ys) + Math.max(...ys)) / 2;
}

place(tree, 0);

const pageW = MARGIN + maxDepth * (BOX_W + GAP) + RESULT_W + MARGIN;
const pageH = HEADER + rows * ROW_H + MARGIN;
const colX = depth => MARGIN + depth * (BOX_W + GAP);

/* ===== TEXT ===== */

// Helvetica character widths (1/1000 em), enough to wrap and align properly
const W_REGULAR = " 278!278\"355#556$556%889&667'191(333)333*389+584,278-333.278/278" +
    "0556155625563556455655665566556755685569556:278;278<584=584>584?556@1015" +
    "A667B667C722D722E667F611G778H722I278J500K667L556M833N722O778P667Q778R722S667T611U722V667W944X667Y667Z611" +
    "[278\\278]278^469_556`333" +
    "a556b556c500d556e556f278g556h556i222j222k500l222m833n556o556p556q556r333s500t278u556v500w722x500y500z500" +
    "{334|260}334~584";
const W_BOLD = " 278!333\"474#556$556%889&722'238(333)333*389+584,278-333.278/278" +
    "0556155625563556455655665566556755685569556:333;333<584=584>584?611@975" +
    "A722B722C722D722E667F611G778H722I278J556K722L611M833N722O778P667Q778R722S667T611U722V667W944X667Y667Z611" +
    "[333\\278]333^584_556`333" +
    "a556b611c556d611e556f333g611h611i278j278k556l278m889n611o611p611q611r389s556t333u611v556w778x556y556z500" +
    "{389|280}389~584";

function widthTable(spec) {
    const table = {};
    for (const match of spec.matchAll(/(.)(\d{3,4})/g)) table[match[1]] = Number(match[2]);
    return table;
}

const WIDTHS = { regular: widthTable(W_REGULAR), bold: widthTable(W_BOLD) };

// data.js is hand-written, so smart quotes and dashes turn up in the text
const ASCII = { "‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-", "…": "..." };
const plain = text => String(text)
    .replace(/[‘’“”–—…]/g, c => ASCII[c])
    .replace(/[^\x20-\x7E]/g, "");

function textWidth(text, size, font = "regular") {
    const widths = WIDTHS[font];
    let total = 0;
    for (const char of text) total += widths[char] ?? 556;
    return (total * size) / 1000;
}

function wrap(text, size, maxWidth, font = "regular") {
    const lines = [];
    let line = "";
    for (const word of plain(text).split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && textWidth(candidate, size, font) > maxWidth) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }
    if (line) lines.push(line);
    return lines;
}

/* ===== DRAWING ===== */

const ops = [];
const num = value => (Math.round(value * 100) / 100).toString();
const y = value => num(pageH - value);          // PDF draws from the bottom up
const rgb = color => `${num(color[0])} ${num(color[1])} ${num(color[2])}`;
const escape = text => plain(text).replace(/([\\()])/g, "\\$1");

function line(points, color, width) {
    ops.push(`${rgb(color)} RG ${num(width)} w`);
    points.forEach(([px, py], i) => ops.push(`${num(px)} ${y(py)} ${i ? "l" : "m"}`));
    ops.push("S");
}

function box(x, top, w, h, fill, border) {
    const rect = `${num(x)} ${y(top + h)} ${num(w)} ${num(h)} re`;
    if (fill) ops.push(`${rgb(fill)} rg ${rect} f`);
    if (border) ops.push(`${rgb(border)} RG 1 w ${rect} S`);
}

function write(text, x, baseline, size, color, font = "regular", align = "left") {
    const shift = align === "right" ? -textWidth(plain(text), size, font) : 0;
    ops.push(`BT ${rgb(color)} rg /${font === "bold" ? "F2" : "F1"} ${num(size)} Tf ` +
        `1 0 0 1 ${num(x + shift)} ${y(baseline)} Tm (${escape(text)}) Tj ET`);
}

/* header */
const questionCount = Object.keys(data).length;
const resultCount = Object.keys(results).length;
write("Which cosmic object are you?", MARGIN, 44, 20, INK, "bold");
write(`The whole quiz map: ${questionCount} questions, ${resultCount} results.`, MARGIN, 64, 9.5, MUTED);
write("Start on the left and follow YES (green) or NO (red) until you reach an object.", MARGIN, 78, 9.5, MUTED);
write("susanna-bekker.github.io/which-cosmic-object-are-you", pageW - MARGIN, 44, 9.5, MUTED, "regular", "right");

/* connectors first, so the boxes sit on top of them */
for (const node of nodes) {
    if (!node.children.length) continue;
    const startX = colX(node.depth) + BOX_W;
    const elbow = startX + GAP / 2;
    for (const { answer, tree: child } of node.children) {
        line(
            [[startX, node.y], [elbow, node.y], [elbow, child.y], [colX(child.depth), child.y]],
            answer === "yes" ? YES_LINE : NO_LINE,
            1,
        );
        write(answer.toUpperCase(), elbow + 4, child.y - 3, LABEL_SIZE, answer === "yes" ? YES : NO, "bold");
    }
}

/* boxes */
for (const node of nodes) {
    const x = colX(node.depth);

    if (node.kind === "question") {
        const lines = wrap(node.text, Q_SIZE, BOX_W - 2 * PAD);
        const h = lines.length * Q_LEAD + 2 * PAD;
        box(x, node.y - h / 2, BOX_W, h, [1, 1, 1], BOX_LINE);
        lines.forEach((text, i) => {
            write(text, x + PAD, node.y - h / 2 + PAD + Q_LEAD * (i + 0.75), Q_SIZE, INK);
        });
        if (node.id === "start") write("START", x, node.y - h / 2 - 6, LABEL_SIZE, MUTED, "bold");
        continue;
    }

    if (node.kind === "loop") {
        box(x, node.y - 10, RESULT_W, 20, [1, 1, 1], BOX_LINE);
        write(`back to "${node.id}"`, x + PAD, node.y + 3, R_SIZE - 1, MUTED);
        continue;
    }

    const color = hex(results[node.id] && results[node.id].color);
    box(x, node.y - 11, RESULT_W, 22, tint(color), color);
    write(node.id, x + PAD, node.y + 3.5, R_SIZE, INK, "bold");
}

/* ===== PDF FILE ===== */

const content = ops.join("\n");
const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(pageW)} ${num(pageH)}] ` +
    "/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    "<< /Title (Which cosmic object are you? - quiz map) /Producer (scripts/build-map.js) >>",
];

let pdf = "%PDF-1.4\n";
const offsets = [];
objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});

const xref = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\n` +
    `startxref\n${xref}\n%%EOF\n`;

const buffer = Buffer.from(pdf, "latin1");

if (process.argv.includes("--check")) {
    const current = fs.existsSync(outFile) ? fs.readFileSync(outFile) : Buffer.alloc(0);
    if (!current.equals(buffer)) {
        console.error("quiz-map.pdf is out of date - run `node scripts/build-map.js` and commit the result.");
        process.exit(1);
    }
    console.log(`OK: quiz-map.pdf matches data.js (${questionCount} questions, ${resultCount} results).`);
} else {
    fs.writeFileSync(outFile, buffer);
    console.log(`Wrote quiz-map.pdf: ${questionCount} questions, ${resultCount} results, ` +
        `${num(pageW)}x${num(pageH)}pt.`);
}
