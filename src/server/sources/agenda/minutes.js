import { Board, Minutes } from '../../svn.js'

const OFFICER_SEPARATOR = /^\s*4. (Executive )?Officer Reports/m;

export default async function (agenda, { request }) {
  let minutes = agenda.split(/^ 3. Minutes from previous meetings/m, 2)
    .pop().split(OFFICER_SEPARATOR)[0];

  let pattern1 = /\s{4}(?<attach>[A-Z])\.\sThe.meeting.of\s+(?<title>.*?)\n(?<text>.*?)\[\s(?:.*?):\s*?(?<approved>.*?)\s*comments:(?<comments>.*?)\n\s{8,9}\]\n/gms;

  let sections = [...minutes.matchAll(pattern1)].map(match => match.groups);

  let results = await Promise.all(sections.map(async (attrs) => {
    attrs.attach = "3" + attrs.attach;
    attrs.text = attrs.text.trim();
    attrs.approved = attrs.approved.trim().replace(/\s+/g, " ");

    let file = (attrs.text.match(/board_minutes[_\d]+\.txt/) || [])[0];

    if (file && await Board.exist(file, request)) {
      // unpublished minutes
      attrs.mtime = await Board.mtime(file, request);
    } else if (file && await Minutes.exist(file, request)) {
      // published minutes
      attrs.mtime = await Minutes.mtime(file, request);
    }

    return attrs;
  }));

  let pattern2 = /\s{4}(?<attach>[A-Z])\.\s+(?<title>Action.*?)\n(?<text>.*)/gm;

  sections = [...agenda.matchAll(pattern2)].map(match => match.groups);

  results.push(...sections.map(attrs => {
    attrs.attach = "3" + attrs.attach;
    attrs.text = attrs.text.trim();
    return attrs;
  }));

  return results;
}
