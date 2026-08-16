/*
 * Cross-file checks that linters can't do, for both pages of the site:
 *  - every local file referenced by the HTML and the CSS exists
 *  - every element id the page's script looks up is present in its HTML
 *
 * These are the failures that still ship green: a renamed image, or an id
 * that drifted out of the HTML, breaks the page while every file stays valid.
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const errors = [];

const pages = [
    { html: "index.html", css: "style.css", js: "script.js" },
    { html: "map.html", css: "map.css", js: "map.js" },
];

const isExternal = (ref) => /^(https?:|data:|#|mailto:)/.test(ref);

function checkFile(ref, source) {
    if (!ref || isExternal(ref)) return;
    const clean = decodeURIComponent(ref.split("?")[0].split("#")[0]);
    if (!fs.existsSync(path.join(root, clean))) {
        errors.push(`${source} references a missing file: ${clean}`);
    }
}

let checkedIds = 0;

for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page.html), "utf8");
    const css = fs.readFileSync(path.join(root, page.css), "utf8");
    const js = fs.readFileSync(path.join(root, page.js), "utf8");

    // src="..." and href="..." in the HTML
    for (const match of html.matchAll(/(?:src|href)\s*=\s*"([^"]*)"/g)) {
        checkFile(match[1], page.html);
    }

    // url(...) in the CSS
    for (const match of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
        checkFile(match[1], page.css);
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
            errors.push(`${page.js} looks up #${id}, which is not in ${page.html}`);
        }
    }
    checkedIds += ids.size;
}

if (errors.length) {
    console.error(`Found ${errors.length} problem(s):\n`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
}

console.log(`OK: all local assets exist, all ${checkedIds} element ids found in their pages.`);
