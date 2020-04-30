// break lines of text at line length, but don't attempt to combine short lines.
export function word_wrap(text, line_width = 80) {
  return text.split("\n").map(line => (
    line.length > line_width
      ? line.replace(new RegExp(`(.{1,${line_width}})(\\s+|$)`, "g"), "$1\n").trim()
      : line
  )).join("\n")
};

// treat text as paragraphs separated by blank lines, combine and word wrap each
// paragraph and indent the result.
export function reflow(text, indent, len) {
  return text.trim().split(/\n\s*\n/).map(line => {
    line = line.replace(/\s+/g, " ").trim();

    return word_wrap(line, len).replace(/^/gm, new Array(indent + 1).join(" "))
  }).join("\n\n")
};