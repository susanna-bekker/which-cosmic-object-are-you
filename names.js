/*
 * An object's name should never be split over two lines: "Proxima Centauri b"
 * broke across a line end on the result card. Both pages run their text through
 * here first, which turns the spaces inside a name into non-breaking ones, so
 * the whole name wraps as one word.
 *
 * Longest names first, so "Asteroid Ceres" is matched before "Ceres".
 */

const NBSP = " ";

const twoWordNames = Object.keys(results)
    .filter((name) => name.includes(" "))
    .sort((a, b) => b.length - a.length);

function keepNamesWhole(text) {
    let whole = text;
    for (const name of twoWordNames) {
        whole = whole.split(name).join(name.replace(/ /g, NBSP));
    }
    return whole;
}
