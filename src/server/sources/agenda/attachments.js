// Attachments

import md5 from "md5";

export default async function (agenda, { quick = true } = {}) {
  let pattern = /-{41}\nAttachment\s\s?(?<attach>\w+):\s(?<title>.*?)\n+(?<report>.*?)(?=-{41,}\n(?:End|Attach))/msg;

  let sections = [...agenda.matchAll(pattern)].map(match => match.groups);

  sections.forEach(attrs => {
    // join multiline titles
    while (attrs.report.startsWith("        ")) {
      let [append, report] = attrs.report.split("\n");
      attrs.title += " " + append.trim();
      attrs.report = report.join("\n");
    };

    attrs.title = attrs.title
      .replace(/^Report from the VP of /m, "")
      .replace(/^Report from the /m, "")
      .replace(/^Status report for the /m, "")
      .replace(/^Apache /m, "")
      .replace("Apache Software Foundation", "ASF");

    if (/\s*\[.*\]$/m.test(attrs.title)) {
      attrs.owner = (attrs.title.match(/\[(.*?)\]/) || [])[1];
      attrs.title = attrs.title.replace(/\s*\[.*\]$/m, "")
    };

    attrs.title = attrs.title
      .replace(/\sTeam$/m, "")
      .replace(/\sCommittee$/m, "")
      .replace(/\sProject$/m, "");

    attrs.digest = md5(attrs.report.trim());

    attrs.report = attrs.report.replace(/\n+$/, "\n");
    if (attrs.report === "\n") delete attrs.report;
    if (!attrs.report || attrs.report.trim().length === 0) attrs.missing = true;

    if (!quick) { // TODO
      try {
        let committee = ASF.Committee.find(attrs.title);
        attrs.chair_email = `${committee.chair.id}@apache.org`;
        attrs.mail_list = committee.mail_list;
        if (attrs.mail_list.includes(" ")) delete attrs.mail_list;
        if (/^Next month: (.*)/m.test(committee.report)) attrs.notes = RegExp.$1
      } catch {
      }
    };

    if (attrs.report.toString().includes("\uFFFD")) {
      attrs.warnings = ["UTF-8 encoding error"]
    }
  });

  return sections;
}
