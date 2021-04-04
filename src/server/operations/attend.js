import { Board } from "../svn.js";
import * as Agenda from "../sources/agenda.js";

//
// Indicate intention to attend / regrets for meeting
//
export default async function attend(request) {
  let { agenda, action, name } = request.body;

  let message = action === "regrets"
    ? "Regrets for the meeting."
    : "I plan to attend the meeting.";

  await Board.revise(agenda, message, request, agenda => {
    let rollcall = agenda.match(/^ \d\. Roll Call.*?\n \d\./ms)?.[0];
    rollcall = rollcall.replace(/ +\n/g, "");
    let directors = rollcall.match(/^ +Directors.*?:\n\n.*?\n\n *Directors.*?:\n\n.*?\n\n/ms)?.[0];
    let officers = rollcall.match(/^ +Executive.*?:\n\n.*?\n\n *Executive.*?:\n\n.*?\n\n/ms)?.[0];
    let guests = rollcall.match(/^ +Guests.*?:\n\n.*?\n\n/ms)?.[0];

    if (directors.includes(name)) {
      let updated = directors.replace(new RegExp(`^ .*${name}.*?\\n`, "m"), "");

      if (action === "regrets") {
        updated = updated
          .replace(/Absent:\n\n.*?\n/, line => `${line.trim()}\n        ${name}\n`)
          .replace(/:\n\n +none\n/, ":\n\n")
          .replace(/Present:\n\n\n/, "Present:\n\n        none\n\n");
      } else {
        updated = updated
          .replace(/Present:\n\n.*?\n/, line => `${line.trim()}\n        ${name}\n`)
          .replace(/Absent:\n\n\n/, "Absent:\n\n        none\n\n");

        // sort Directors
        updated = updated.replace(/Present:\n\n(.*?)\n\n/ms, (match) => {
          let before = RegExp.$1;
          let after = before.split("\n").sort((name1, name2) => (
            `${name1.split(' ').pop()} ${name1}`.localeCompare(`${name2.split(' ').pop()} ${name2}`)
          ));
          return match.replace(before, after.join("\n"))
        })
      };

      rollcall = rollcall.replace(directors, updated)

    } else if (officers.includes(name)) {

      let updated = officers.replace(new RegExp(`^ .*${name}.*?\\n`, "m"), "");

      if (action === "regrets") {
        updated = updated
          .replace(/Absent:\n\n.*?\n/, line => `${line.trim()}\n        ${name}\n`)
          .replace(/:\n\n +none\n/, ":\n\n")
          .replace(/Present:\n\n\n/, "Present:\n\n        none\n\n");
      } else {
        updated = updated
          .replace(/Present:\n.*?\n\n/s, line => `${line.trim()}\n        ${name}\n\n`)
          .replace(/Absent:\n\n\n/, "Absent:\n\n        none\n\n");
      };

      rollcall = rollcall.replace(officers, updated)

    } else if (action === "regrets") {

      let updated = guests
        .replace(new RegExp(`^ .*${name}.*?\\n`, "m"), "")
        .replace(/:\n\n\n/, ":\n\n        none\n");

      rollcall = rollcall.replace(guests, updated)

    } else if (!guests.includes(name)) {

      let updated = guests
        .replace(/\n$/, `        ${name}\n\n`)
        .replace(/:\n\n +none\n/, ":\n\n");

      rollcall = rollcall.replace(guests, updated)
    };

    return agenda.replace(/^ \d\. Roll Call.*?\n \d\./ms, rollcall);
  })

  return {agenda: await Agenda.read(agenda, request)};
}
