// Back sections:
// * Review Outstanding Action Items
// * Unfinished Business
// * New Business
// * Announcements
// * Adjournment

import moment from 'moment-timezone';
import { minutesLink } from '../agenda.js';
import { TIMEZONE } from '../../config.js';

export default async function (agenda, { quick = false } = {}) {
  let pattern = /^(?<attach>(?:\s9|1\d)\.)\s(?<title>.*?)\n(?<text>.*?)(?=\n[\s1]\d\.|\n===)/msg;

  let sections = [...agenda.matchAll(pattern)].map(match => match.groups);

  sections.forEach(attrs => {
    attrs.attach = attrs.attach.trim();
    attrs.title = attrs.title.replace(/^Review Outstanding /m, "");

    if (/Discussion|Action|Business|Announcements/.test(attrs.title)) {
      attrs.prior_reports = minutesLink(attrs.title)
    } else if (attrs.title === "Adjournment") {
      let date = (agenda.match(/\w+ \d+, \d+/) || [])[0];
      let time = (attrs.text.match(/\d+:\d+([ap]m)?/) || [])[0];
      if (date && time) {
        attrs.timestamp = moment.tz(`${date} ${time}`, 'LLL', TIMEZONE).valueOf();
      }
    };

    if (/Action Items/.test(attrs.title)) {
      // extract action items associated with projects
      let text = attrs.text.replace(/^\s*\n/, "").replace(/\s+$/, "");

      let unindent = Math.min(...(text.match(/^ *\S/gm) || []).map(item => (item.length))) || 1;

      text = text.replace(new RegExp(`^ {${unindent - 1}}`, "gm"), "");
      attrs.missing = text.length === 0;

      attrs.actions = text.replace(/^\* /m, "").split(/^\n\* /m).map(text => {
        let match2, match3, match4;
        let match1 = /(.*?)(\n\s*Status:(.*))/sm.exec(text);

        if (match1) {
          match2 = /([^]*?)(\[ ([^\]]+) \])?\s*$/s.exec(match1[1]);
          match3 = /([^]*?): ([^]*)$/s.exec(match2[1]);
          match4 = /(.*?)( (\d+-\d+-\d+))?$/ms.exec(match2[3]);

          return {
            owner: match3[1],
            text: match3[2].trim(),
            status: match1[3].toString().trim(),
            pmc: (match4 ? match4[1] : null),
            date: (match4 ? match4[3] : null)
          }
        } else {
          return {owner: "", text: text.trim(), status: "", pmc: "", date: ""}
        }
      })
    }
  });

  return sections;
}
