// 
// Discussion Items
//

import { minutesLink } from '../agenda.js';

export default async function discussion(agenda) {
  let discussion = agenda.split(/^ \d. Discussion Items\n/ms).pop().split(/^ \d. .*Action Items/ms)[0];

  let sections;

  if (!/^\s{3,5}[0-9A-Z]\./ms.test(discussion)) {
    // One (possibly empty) item for all Discussion Items
    let pattern = /^(?<attach>\s[8]\.)\s(?<title>.*?)\n(?<text>.*?)(?=\n[\s1]\d\.|\n===)/ms;

    sections = [agenda.match(pattern).groups];

    for (let attrs of sections) {
      attrs.attach = attrs.attach.trim();
      attrs.prior_reports = minutesLink(attrs.title);
    }
  } else {
    // Separate items for each individual Discussion Item
    let pattern = /\n+(?<indent>\s{3,5})(?<attach>[0-9A-Z])\.\s(?<title>[^]*?)\n(?<text>[^]*?)(?=\n\s{3,5}[0-9A-Z]\.\s|$)/sg;

    sections = [...discussion.matchAll(pattern)].map(match => match.groups);

    for (let attrs of sections) {
      attrs.attach = "8" + attrs.attach;
      if (attrs.text.trim().length === 0) attrs.warnings = ["Body is missing"]
    };
  }

  return sections;
}
