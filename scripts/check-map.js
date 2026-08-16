/*
 * Checks that the map page still matches the quiz:
 *  - every question and result in data.js has a place on the map, and nothing
 *    is left on the map that the quiz no longer has
 *  - every result has a small picture in pictures/small/
 *
 * The layout comes from the poster (scripts/extract-layout.py), so editing
 * data.js without redrawing the poster would silently leave a hole in the map.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const { data, results } = vm.runInNewContext(`${read("data.js")}\n;({ data, results });`);
const { mapLayout } = vm.runInNewContext(`${read("map-layout.js")}\n;({ mapLayout });`);

const errors = [];

function compare(what, expected, actual) {
    for (const key of expected) {
        if (!actual.includes(key)) errors.push(`${what} "${key}" is in data.js but not on the map`);
    }
    for (const key of actual) {
        if (!expected.includes(key)) errors.push(`${what} "${key}" is on the map but not in data.js`);
    }
}

compare("question", Object.keys(data), Object.keys(mapLayout.questions || {}));
compare("result", Object.keys(results), Object.keys(mapLayout.results || {}));

for (const name of Object.keys(mapLayout.results || {})) {
    const small = path.join("pictures", "small", `${name}.webp`);
    if (!fs.existsSync(path.join(root, small))) {
        errors.push(`result "${name}" has no small picture: ${small} (run scripts/make-map-assets.py)`);
    }
}

if (!fs.existsSync(path.join(root, "pictures", "small", "sky.webp"))) {
    errors.push("pictures/small/sky.webp is missing (run scripts/make-map-assets.py)");
}

// one arrow pair and one label per answer
const answers = Object.keys(data).length * 2;
if ((mapLayout.labels || []).length !== answers) {
    errors.push(`the map has ${(mapLayout.labels || []).length} YES/NO labels, but the quiz has ${answers} answers`);
}
if (!(mapLayout.arrows || []).length) {
    errors.push("the map has no arrows");
}

if (errors.length) {
    console.error(`Found ${errors.length} problem(s) between data.js and the map:\n`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
}

console.log(
    `OK: the map has all ${Object.keys(data).length} questions and ${Object.keys(results).length} results, ` +
    `${mapLayout.arrows.length} arrow paths and every small picture.`
);
