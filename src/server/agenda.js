import front from './agenda/front.js';
import minutes from './agenda/minutes.js';
import execOfficer from './agenda/execOfficer.js';
import attachments from './agenda/attachments.js';
import committee from './agenda/committee.js';
import special from './agenda/special.js';
import discussion from './agenda/discussion.js';
import back from './agenda/back.js';

export function minutesLink(title) {
  return "https://whimsy.apache.org/board/minutes/" + title.replace(/\W/g, "_")
}

export async function parse(agenda, request) {
  // replace tabs with spaces
  agenda = agenda.replace(/^(\t+)/gm, function (tabs) { return new Array((8 * tabs.length) + 1).join(" ") });

  let options = { request };

  // run each of the scanners
  let items = (await Promise.all([
    front(agenda, options),
    minutes(agenda, options),
    execOfficer(agenda, options),
    attachments(agenda, options),
    committee(agenda, options),
    special(agenda, options),
    discussion(agenda, options),
    back(agenda, options)
  ])).flat();

  // merge sections
  let sections = new Map();
  items.forEach(section => {
    let attach = section.attach;
    if (!sections.has(attach)) sections.set(attach, {});
    Object.assign(sections.get(attach), section);
  });

  items = Array.from(sections.values());
  
  // cleanup
  for (let section of items) {
    // parse approved into invididual approvals
    if (section.approved) {
      section.approved = section.approved.trim().split(/, ?/);
    }

    // unindent text or report
    let text = section.text || section.report;
    if (text) {  
      let unindent = Math.min(...text.match(/^ *\S/gm).map(item => (item.length))) || 1;
      text = text.replace(new RegExp(`^ {${unindent - 1}}`, "gm"), "").trim();
      section.text ? section.text = text : section.report = text;
    };
  };

  return items;
}