// Additional Officer Reports and Committee Reports

export default async function (agenda) {
  let pattern = /\[(?<owner>[^\n]+)\]\n\n\s{7}See\sAttachment\s\s?(?<attach>\w+)[^\n]*?\s+\[\s[^\n]*\s*approved:\s*?(?<approved>.*?)\s*comments:(?<comments>.*?)\n\s{9}\]/msg;

  let sections = [...agenda.matchAll(pattern)].map(match => match.groups);

  for (let attrs of sections) {
    attrs.shepherd = attrs.owner.split("/").pop().trim();
    attrs.owner = attrs.owner.split("/")[0].trim();
    attrs.comments = attrs.comments.replace(/^ {1,10}(\w+:)/gm, "$1").replace(/^ {11}/gm, "");
  };

  return sections;
}