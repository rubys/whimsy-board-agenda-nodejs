// Executive Officer Reports
import md5 from 'md5';

const OFFICER_SEPARATOR = /^\s*4. (Executive )?Officer Reports/m;

export default async function (agenda, { quick = false } = {}) {
  let reports = agenda.split(OFFICER_SEPARATOR, 3).pop();
  reports = reports.split(/^ 5. (Additional Officer|Committee) Reports/m, 3)[0];

  let pattern = /\s{4}(?<attach>[A-Z])\.\s(?<title>[^[]+?)\s\[(?<owner>[^\]]+?)\](?<report>[^]*?)(?=\n\s{4}[A-Z]\.\s|$)/sg;

  let sections = [...reports.matchAll(pattern)].map(match => match.groups);

  sections.forEach(attrs => {
    attrs.attach = "4" + attrs.attach;
    attrs.shepherd = attrs.owner.split("/").pop();
    attrs.owner = attrs.owner.split("/")[0];
    attrs.report = attrs.report.replace(/^\s*\n/, "");

    attrs.report = attrs.report.replace(
      /\n\s*\n\s+\[ comments:(.*)\]\s*$/gsm,

      (_, comments) => {
        attrs.comments = comments.replace(/^\s*\n/, "").replace(/\s+$/, "");
        return "\n"
      }
    );

    let report = attrs.report.trim();

    if (report.length === 0 || report.slice(0, 13) === "Additionally,") {
      attrs.missing = true
    };

    attrs.digest = md5(report)
  });

  return sections;
}
