/*
 * Checks that the quiz in data.js is complete:
 *  - every yes/no answer leads to another question or a real result
 *  - every result has an image file that exists in pictures/
 *  - every question can actually be reached from "start"
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "data.js"), "utf8");

// data.js is a plain browser script, so run it and read the values back out
const { data, results } = vm.runInNewContext(`${source}\n;({ data, results });`);
const errors = [];

if (!data || !results) {
    errors.push("data.js must define both `data` and `results`");
}

// every answer leads somewhere real
for (const [id, node] of Object.entries(data || {})) {
    for (const answer of ["yes", "no"]) {
        const next = node[answer];
        if (!next) {
            errors.push(`question "${id}" has no "${answer}" answer`);
        } else if (!(next in data) && !(next in results)) {
            errors.push(`question "${id}" (${answer}) points to "${next}", which is not a question or a result`);
        }
    }
    if (!node.text) {
        errors.push(`question "${id}" has no text`);
    }
}

// every result has text and an image that exists
for (const [name, result] of Object.entries(results || {})) {
    if (!result.text) {
        errors.push(`result "${name}" has no text`);
    }
    if (!result.image) {
        errors.push(`result "${name}" has no image`);
    } else if (!fs.existsSync(path.join(root, result.image))) {
        errors.push(`result "${name}" points to a missing image: ${result.image}`);
    }
}

// every question and result is reachable from the start
const reached = new Set();
const queue = ["start"];
while (queue.length) {
    const id = queue.shift();
    if (reached.has(id)) continue;
    reached.add(id);
    const node = (data || {})[id];
    if (node) queue.push(node.yes, node.no);
}
for (const id of Object.keys(data || {})) {
    if (!reached.has(id)) errors.push(`question "${id}" is unreachable from "start"`);
}
for (const name of Object.keys(results || {})) {
    if (!reached.has(name)) errors.push(`result "${name}" is unreachable from "start"`);
}

if (errors.length) {
    console.error(`Found ${errors.length} problem(s) in data.js:\n`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
}

console.log(
    `OK: ${Object.keys(data).length} questions, ${Object.keys(results).length} results, all images present.`
);
