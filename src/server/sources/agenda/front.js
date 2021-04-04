// Front sections:
// * Call to Order
// * Roll Call

import moment from 'moment-timezone';
import * as ldap from '../../ldap.js';
import { TIMEZONE } from '../../config.js';

export default async function front(agenda) {
  let pattern = /^\n\x20(?<attach>[12]\.)\s(?<title>.*?)\n\n+(?<text>.*?)(?=\n\s[23]\.)/msg;

  let sections = [...agenda.matchAll(pattern)].map(match => match.groups);

  let names = await ldap.names();
  let members = await ldap.members();

  for (let attrs of sections) {
    if (attrs.title === "Roll Call") {
      attrs.people = {};
      let absent = attrs.text.match(/Absent:\n\n.*?\n\n/gsm).join();
      let directors = attrs.text.match(/^ +Directors[ \S]*?:\n\n.*?\n\n/gsm).join();
      let officers = attrs.text.match(/^ +Executive[ \S]*?:\n\n.*?\n\n/gsm).join();

      // attempt to identify the people mentioned in the Roll Call
      let people = Array.from(attrs.text.matchAll(/^ {8}(\w.*)/gm),
        match => match[1]
      );

      for (let name of people) {
        if (name === "none") continue;

        // Remove extraneous [comments in past board minutes
        name = name.replace(/(\s*[[(]|\s+-).*/g, "").trim();
        let role = "guest";
        if (directors.includes(name)) role = "director";
        if (officers.includes(name)) role = "officer";

        // build sort_name by rotating the last name to the front
        let words = name.replace(/\(.*\)\s*$/sm, "").split(" ");
        words.unshift(words.pop());
        let sort_name = words.join(" ");

        if (!names) {
          attrs.people["_" + name.replace(/\W/g, "_")] = {
            name,
            sortName: sort_name,
            role,
            attending: !absent.includes(name)
          }
        } else {
          // look up name
          let id = names[name];

          // if found, save results in the attributes
          if (id) {
            attrs.people[id] = {
              name,
              sortName: sort_name,
              role,
              member: members.includes(id),
              attending: !absent.includes(name)
            }
          } else {
            // If not found, fallback to @quick behavior; WHIMSY-189
            attrs.people["_" + name.replace(/\W/g, "_")] = {
              name,
              sortName: sort_name,
              role,
              attending: !absent.includes(name)
            }
          }
        }
      }

      if (attrs.people) {
        const compareFn = (a, b) => (a[1].sortName > b[1].sortName) ? 1 : -1;
        attrs.people = Object.fromEntries(Object.entries(attrs.people).sort(compareFn));
      }
    } else if (attrs.title === "Call to order") {
      let date = (agenda.match(/\w+ \d+, \d+/) || [])[0];
      let time = (attrs.text.match(/\d+:\d+([ap]m)?/) || [])[0];
      if (date && time) {
        attrs.timestamp = moment.tz(`${date} ${time}`, 'LLL', TIMEZONE).valueOf();
      }
    }
  };

  return sections;
}
