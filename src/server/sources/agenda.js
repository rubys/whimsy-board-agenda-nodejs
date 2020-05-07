import front from './agenda/front.js';
import minutes from './agenda/minutes.js';
import execOfficer from './agenda/execOfficer.js';
import attachments from './agenda/attachments.js';
import committee from './agenda/committee.js';
import special from './agenda/special.js';
import discussion from './agenda/discussion.js';
import back from './agenda/back.js';
import * as cache from '../cache.js';
import { Board } from "../svn.js"

export function minutesLink(title) {
  return "https://whimsy.apache.org/board/minutes/" + title.replace(/\W/g, "_")
}

// mapping of agenda section numbers to section names
const CONTENTS = {
  '2.': 'Roll Call',
  '3A': 'Minutes',
  '4A': 'Executive Officer',
  '1': 'Additional Officer',
  'A': 'Committee Reports',
  '7A': 'Special Orders',
  '8.': 'Discussion Items',
  '8A': 'Discussion Items',
  '9.': 'Action Items'
}

export async function read(filename, request) {
  // first check cache
  let mtime = await Board.mtime(filename, request);
  let cacheFile = filename.replace('.txt', '.json');
  let agenda = await cache.read(cacheFile, 5 * 60 * 1000, mtime);
  if (agenda) return JSON.parse(agenda);

  // read from local svn working copy
  agenda = await Board.read(filename);
  if (!agenda) return null;

  let items = await parse(agenda, request);

  cache.write(cacheFile, JSON.stringify(items));
  return items;
}

export async function parse(agenda, request) {
  // canonicalize line endings
  if (agenda.includes('\r')) agenda = agenda.replace(/\r\n?/g, "\n");

  // replace tabs with spaces
  agenda = agenda.replace(/^(\t+)/gm, tabs => new Array(8 * tabs.length + 1).join(" "));

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

  // add index markers for major sections
  for (let [section, index] of Object.entries(CONTENTS)) {
    if (sections.has(section)) {
      sections.get(section).index = index
    }
  }

  // convert back to an array
  items = Array.from(sections.values());

  // extract flagged reports
  let flagged_reports = Object.fromEntries(
    Array.from(
      agenda.match(/ \d\. Committee Reports.*?\n\s+A\./sm)?.[0]
        ?.matchAll(/# (.*?) \[(.*)\]/g),
      s => s.slice(1)));

  // cleanup
  for (let section of items) {
    // parse approved into invididual approvals
    if ('approved' in section) {
      section.approved = section.approved.trim().split(/, ?/);
      if (section.approved.length === 1 && section.approved[0] === '') {
        section.approved = []
      }
    }

    if (section.title in flagged_reports) {
      section.flagged_by = flagged_reports[section.title].split(/, */)
    }

    // unindent text or report
    let text = section.text || section.report;
    if (text) {
      let unindent = Math.min(...Array.from(text.matchAll(/^ *\S/gm)).map(item => (item[0].length))) || 1;
      text = text.replace(new RegExp(`^ {${unindent - 1}}`, "gm"), "").trim();
      section.text ? section.text = text : section.report = text;
    };
  };

  return items;
}
