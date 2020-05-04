
aliases = {
  "c++ standard library": "stdcxx",
  "community development": "comdev",

  // TODO: are the concom entries correct? See INFRA-17782
  "conference planning": "concom",
  conferences: "concom",
  "distributed release audit tool": "drat",
  "diversity and inclusion": "diversity",
  "http server": "httpd",
  httpserver: "httpd",
  incubating: "incubator",
  "java community process": "jcp",
  "logging services": "logging",
  "lucene.net": "lucenenet",
  "open climate workbench": "climate",
  "portable runtime": "apr",
  quetzalcoatl: "quetz",
  "security team": "security",
  "travel assistance": "tac",
  "web services": "ws"
};

namemap = (name) => (
  // Drop parenthesized comments and downcase before lookup; drop all spaces after lookup
  // So aliases table does not need to contain entries for Traffic Server and XML Graphics.
  // Also compress white-space before lookup so tabs etc from index.html don't matter
  (aliases[name.replace(/\s+\(.*?\)/, "").trim().replace(/\s+/g, " ").toLowerCase] || name).replace(/\s+/g, "")
);

// extract chairs, list of nonpmcs, roster, start date, and reporting
// information from <tt>committee-info.txt</tt>.
function parse(contents) {
  // List uses full (display) names as keys, but the entries use the canonical names
  // - the local version of find() converts the name
  // - and stores the original as the display name if it has some upper case
  let list = {};

  // Split the file on lines starting "* ", i.e. the start of each group in section 3
  let info = contents.split(/^\* /m);

  // Extract the text before first entry in section 3 and split on section headers,
  // keeping sections 1 (COMMITTEES) and 2 (REPORTING).
  let [head, report] = info.shift().split(/^\d\./m).slice(1, 3);

  // Extract the text before first entry in section 3 and split on section headers,
  // keeping sections 1 (COMMITTElist group headers
  head = head.replace(/^\s+NAME\s+CHAIR\s*$/gm, "");
  head = head.replace(/^\s+Office\s+Officer\s*$/gim, "");

  // extract the committee chairs (e-mail address is required here)
  // Note: this includes the non-PMC entries
  // Scan for entries even if there is a missing extra space before the chair column
  for (let line of head.match(/^[ \t]+\w.*?[ \t]+.*[ \t]+<.*?@apache\.org>/gm)) {
    let committee, name, id;

    // Now weed out the malformed lines
    let m = line.match(/^[ \t]+(\w.*?)[ \t][ \t]+(.*)[ \t]+<(.*?)@apache\.org>/m);

    if (m) {
      let [committee, name, id] = m.slice(1);
      if (!list[committee]) list[committee] = {chairs: []};

      if (!list[committee].chairs.some(chair => chair.id == id)) {
        list[committee].chairs.push({ name, id })
      }
    } else {
      // not possible to determine where one name starts and the other begins
      console.warn(`Missing separator before chair name in: '${line}'`)
    }
  };

  // Extract the non-PMC committees (e-mail address may be absent)
  // first drop leading text (and Officers) so we only match non-PMCs
  let nonpmcs = [...new Set(head.replace(/.*?also has /m, "").replace(/ Officers:.*/m, "")
    .match(/^[ \t]+(\w.*?)(?:[ \t][ \t]|[ \t]?$)/gm).flat(Infinity))].map(name => (list[name]));

  // Extract officers
  // first drop leading text so we only match officers at end of section
  let officers = [... new Set(head.replace(/.*?also has .*? Officers/m, "")
    .match(/^[ \t]+(\w.*?)(?:[ \t][ \t]|[ \t]?$)/gm)
    .flat(Infinity))].map(name => list[name]);

  // store the paragraph identifiers: Board Committees etc
  let head_parts = head.split(/^The ASF also has the following +/m);

  for (let h = 1; h <= head_parts.size - 1; h++) {
    let part = head_parts[h];
    let type = (part.match(/^([^:]+)/m) || [])[1];

    for (let cttee of part.match(/^[ \t]+(\w.*?)(?:[ \t][ \t]|[ \t]?$)/gm).flat(Infinity).uniq) {
      list[cttee].paragraph = type
    }
  };

  // for each committee in section 3
  for (let roster of info) {
    // extract the committee name (and parenthesised comment if any)
    let name = (roster.match(/(\w.*?)[ \t]+\(est/) || [])[1];

    if (!list[name]) {
      console.warn(`No chair entry detected for ${name} in section 3`)
    };

    let committee = list[name];

    // get and normalize the start date
    let established = (roster.match(/\(est\. (.*?)\)/) || [])[1];
    if (/^\d\//m.test(established)) established = `0${established}`;
    committee.established = established;

    // match non-empty entries and check the syntax
    for (let line of roster.match(/^[ \t]+.+$/mg)) {
      if (!/\s<(.*?)@apache\.org>\s/.test(line)) {
        console.warn(`Invalid syntax: ${committee.name} '${line}'`)
      }
    };

    // extract the availids (is this used?)
    committee.info = Array.from(
      roster.matchAll(/<(.*?)@apache\.org>/g),
      s => s.slice(1)
    ).flat(Infinity);

    // drop (chair) markers and extract 0: name, 1: availid, 2: [date], 3: date
    // the date is optional (e.g. infrastructure)
    committee.roster = Object.fromEntries(Array.from(
      roster.replace(/\(\w+\)/g, "").matchAll(/^[ \t]*(.*?)[ \t]*<(.*?)@apache\.org>(?:[ \t]+(\[(.*?)\]))?/gm),
      s => s.slice(1)
    ).map(list => [list[1], { name: list[0], date: list[3] }]))
  };

  // process report section
  for (let [period, committees] of Array.from(
    report.matchAll(/^([^\n]+)\n---+\n(.*?)\n\n/gms),
    s => s.slice(1)
  )) {
    for (let committee of Array.from(
      committees.matchAll(/^   [ \t]*(.*)/gm),
      s => s.slice(1)
    )) {
      let comment;
      [committee, comment] = committee[0].split(/[ \t]+#[ \t]+/, 2);

      if (!list[committee]) {
        console.warn(`Unexpected name '${committee}' in report section; ignored`);
        continue
      };

      committee = list[committee];

      if (comment) {
        committee.report = `${period}: ${comment}`
      } else if (period == "Next month") {
        committee.report = "Every month"
      } else {
        committee.schedule = period
      }
    }
  };

  let committee_info = [...new Set(Object.values(list).filter(value => !officers.includes(value)))];

  // Check if there are duplicates.
  for (let c of committee_info) {
    if (c.chairs.length != 1 && c.name != "fundraising") {
      console.warn(`Unexpected chair count for ${c.display_name}:`, c.chairs)
    }
  };

  return { committee_info, nonpmcs, officers }
};
