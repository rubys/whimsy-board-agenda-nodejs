import Store from "./store.js";
import * as Actions from "../actions.js"

// A convenient place to stash server data
export const Server = {
  pending: {},
  drafts: [],
  agendas: [],
  websocket: 'ws://localhost:3001/websocket/'
};

//
// function to assist with production of HTML and regular expressions
//
// Escape HTML characters so that raw text can be safely inserted as HTML
export function htmlEscape(string) {
  return string.replace(
    htmlEscape.chars,
    c => htmlEscape.replacement[c]
  )
};

htmlEscape.chars = /[&<>]/g;
htmlEscape.replacement = {"&": "&amp;", "<": "&lt;", ">": "&gt;"};

// escape a string so that it can be used as a regular expression
export function escapeRegExp(string) {
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
  return string.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1")
};

// Replace http[s] links in text with anchor tags
export function hotlink(string) {
  return string.replace(
    hotlink.regexp,
    (match, pre, link) => `${pre}<a href='${link}'>${link}</a>`
  )
};

hotlink.regexp = /(^|[\s.:;?\-\]<(])(https?:\/\/[-\w;/?:@&=+$.!~*'()%,#]+[\w/])(?=$|[\s.:;,?\-[\]&)])/g;

//
// Requests to the server
//
// "AJAX" style post request to the server, with a callback
export function post(target, data, block) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", `../json/${target}`, true);

  xhr.setRequestHeader(
    "Content-Type",
    "application/json;charset=utf-8"
  );

  xhr.responseType = "text";

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      data = null;

      try {
        let message;

        if (xhr.status === 200) {
          data = JSON.parse(xhr.responseText);
          if (data.exception) alert(`Exception\n${data.exception}`)
        } else if (xhr.status === 404) {
          alert(`Not Found: json/${target}`)
        } else if (xhr.status >= 400) {
          if (!xhr.response) {
            message = `Exception - ${xhr.statusText}`
          } else if (xhr.response.exception) {
            message = `Exception\n${xhr.response.exception}`
          } else {
            try {
              message = `Exception\n${JSON.parse(xhr.responseText).exception}`
            } catch {
              message = `Exception\n${xhr.responseText}`
            }
          };

          console.log(message);
          alert(message)
        }
      } catch (e) {
        console.log(e)
      };

      block(data)
    }
  };

  xhr.send(JSON.stringify(data))
};

// "AJAX" style get request to the server, with a callback
//
// Would love to use/build on 'fetch', but alas:
//
//   https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API#Browser_compatibility 
export function retrieve(target, type, block) {
  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 1) {
      Store.dispatch(Actions.clockIncrement())
    } else if (xhr.readyState === 4) {
      let data = null;

      try {
        let message;

        if (xhr.status === 200) {
          if (type === "json") {
            data = xhr.response || JSON.parse(xhr.responseText)
          } else {
            data = xhr.responseText
          }
        } else if (xhr.status === 404) {
          alert(`Not Found: ${type}/${target}`)
        } else if (xhr.status >= 400) {
          if (!xhr.response) {
            message = `Exception - ${xhr.statusText}`
          } else if (xhr.response.exception) {
            message = `Exception\n${xhr.response.exception}`
          } else {
            try {
              message = `Exception\n${JSON.parse(xhr.responseText).exception}`
            } catch (e) {
              message = `Exception\n${xhr.responseText}`
            }
          };

          console.log(message);
          alert(message)
        }
      } catch (e) {
        console.log(e)
      };

      block(data);
      Store.dispatch(Actions.clockDecrement())
    }
  };

  if (/^https?:/m.test(target)) {
    xhr.open("GET", target, true);
    if (type === "json") xhr.setRequestHeader("Accept", "application/json")
  } else {
    xhr.open("GET", `../${type}/${target}`, true)
  };

  xhr.responseType = type;
  xhr.send()
};

//
// Reflow comments and lines
//
export class Flow {
  // reflow comment
  static comment(comment, initials, indent="    ") {
    let lines = comment.split("\n");
    let len = 71 - indent.length;

    for (let i = 0; i < lines.length; i++) {
      lines[i] = (i === 0 ? initials + ": " : `${indent} `) + lines[i].replace(
        new RegExp(`(.{1,${len}})( +|$\\n?)|(.{1,${len}})`, "g"),
        `$1$3\n${indent}`
      ).trim()
    };

    return lines.join("\n")
  };

  // reflow text.  Indent is a string containing the amount of spaces that are
  // to be added to each line.  The Incubator has special punctuation rules that
  // prohibit the joining of lines where the first line ends in either a colon
  // or a question mark.
  static text(text, indent="", puncrules=false) {
    // remove trailing spaces on lines
    text = text.replace(/[ \r\t]+\n/g, "\n");

    // split into lines
    let lines = text.split("\n");

    // join consecutive lines, making exception for lines that start with a 
    // hash (#) and <markers> like <private>, ")".
    for (let i = lines.length - 1; i >= 1; i--) {
      if (/^$|^#|\w>$/m.test(lines[i - 1])) continue;
      if (puncrules && /[:?]$/m.test(lines[i - 1])) continue;

      if (/^\s*\w/m.test(lines[i]) && !/^\s*\d+\./m.test(lines[i])) {
        lines.splice(i - 1, 2, lines[i - 1] + lines[i].replace(/^\s*/m, " "))
      }
    };

    // reflow each line
    let len = 78 - indent.length;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.length <= len) continue;
      let prefix = /^\d+\.\s+|^\W*/m.exec(line)[0];

      if (prefix.length === 0) {
        // not indented -> split
        lines[i] = line.replace(
          new RegExp(`(.{1,${len}})( +|$\\n?)`, "g"),
          "$1\n"
        ).replace(/[\n\r]+$/m, "")
      } else {
        // ensure line can be split after column 40
        let lastspace = /^.*\s\S/m.exec(line);

        if (lastspace && lastspace[0].length - 1 > 40) {
          // preserve indentation.
          let n = len - prefix.length;
          indent = prefix.replace(/\S/g, " ");

          lines[i] = prefix + line.slice(prefix.length).replace(
            new RegExp(`(.{1,${n}})( +|$\\n?)`, "g"),
            indent + "$1\n"
          ).replace(indent, "").replace(/[\n\r]+$/m, "")
        }
      }
    };

    return lines.join("\n")
  }
};

//
// Split comments string into individual comments
//
export function splitComments(string) {
  let results = [];
  if (!string) return results;
  let comment = "";

  for (let line of string.split("\n")) {
    if (/^\S/m.test(line)) {
      if (comment.length !== 0) results.push(comment);
      comment = line
    } else {
      comment += "\n" + line
    }
  };

  if (comment.length !== 0) results.push(comment);
  return results
};
