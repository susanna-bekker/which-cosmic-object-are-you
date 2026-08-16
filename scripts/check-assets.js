/*
 * Cross-file checks that linters can't do:
 *  - every local file referenced by index.html and style.css exists
 *  - every element id script.js looks up is actually present in index.html
 *
 * These are the failures that still ship green: a renamed image, or an id
 * that drifted out of the HTML, breaks the page while every file stays valid.
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const errors = [];

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "style.css"), "utf8");
const js = fs.readFileSync(path.join(root, "script.js"), "utf8");

const isExternal = (ref) => /^(https?:|data:|#|mailto:)/.test(ref);

function checkFile(ref, source) {
    if (!ref || isExternal(ref)) return;
    const clean = decodeURIComponent(ref.split("?")[0].split("#")[0]);
    if (!fs.existsSync(path.join(root, clean))) {
        errors.push(`${source} references a missing file: ${clean}`);
    }
}

// src="..." and href="..." in the HTML
for (const match of html.matchAll(/(?:src|href)\s*=\s*"([^"]*)"/g)) {
    checkFile(match[1], "index.html");
}

// url(...) in the CSS
for (const match of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    checkFile(match[1], "style.css");
}

// ids the script looks up must exist in the HTML
const ids = new Set();
for (const match of js.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)) {
    ids.add(match[1]);
}
for (const match of js.matchAll(/querySelector(?:All)?\(\s*["']#([A-Za-z0-9_-]+)["']\s*\)/g)) {
    ids.add(match[1]);
}
for (const id of ids) {
    if (!new RegExp(`id\\s*=\\s*["']${id}["']`).test(html)) {
        errors.push(`script.js looks up #${id}, which is not in index.html`);
    }
}

if (errors.length) {
    console.error(`Found ${errors.length} problem(s):\n`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
}

console.log(`OK: all local assets exist, all ${ids.size} element ids found in index.html.`);
