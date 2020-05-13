//
// edit exiting / post new report
//
import { Board } from "../svn.js";
import { parse, read } from "../sources/agenda.js";

// TODO: add support for posting from reporter.apache.org

export default async function (request) {
  let { agenda, message, attach, report, title, digest } = request.body;

  // special case for new special orders
  if (attach === "7?") {
    message = `Post Special Order 7X: ${title}`
  } else if (attach === "8?") {
    message = `Post Discussion Item 8X: ${title}`
  };

  await Board.revise(
    agenda,
    message,
    request,

    async agenda => {
      // parse agenda
      let parsed = await parse(agenda, request);

      // remove trailing whitespace
      report = report.trimEnd();

      // convert unicode blank characters to an ASCII space
      report = report.replace(/\p{gc=Space_Separator}/gu, " ");

      if (attach === "7?") {
        // new special order
        // adjust indentation
        let indent = report.match(/^ +/gm)?.sort()?.[0];

        if (indent) {
          report = report.replace(new RegExp(`^${indent}`, "gm"), "")
        };

        report = report.replace(/^(\S)/gm, "       $1");

        // add fine next order letter and add it to the title
        let order = parsed.map(section => section.attach).filter(attach => /^7\w/m.test(attach)).sort().pop().slice(1);
        order = order ? String.fromCharCode(order.charCodeAt(0) + 1) : 'A';
        title = `    ${order}. ${title}\n\n`;

        // update the commit message that will be used
        message = message.replace("7X", `7${order}`);

        // insert into agenda
        let insertionPoint = agenda.match(/\n() 8\. Discussion Items/).index;
        agenda = agenda.slice(0, insertionPoint) + `\n${title}${report}\n\n` + agenda.slice(insertionPoint + 1)
      } else if (attach === "8?") {
        // new discussion item
        // adjust indentation
        let indent = report.match(/^ +/gm)?.sort()?.[0];

        if (indent) {
          report = report.replace(new RegExp(`^${indent}`, "gm"), "")
        };

        report = report.replace(/^(\S)/gm, "       $1");

        // add item letter to title
        let discussion = (agenda.match(/ 8\. Discussion Items.*\n 9\./m) || [])[0];

        let items = Array.from(
          discussion.matchAll(/^    ([A-Z]+)\./gm),
          s => s.slice(1)
        ).flat(Infinity);

        let item = items.sort().pop();
        item = item ? String.fromCharCode(item.charCodeAt(0) + 1) : 'A';
        let title = `    ${item}. ${title}\n\n`;

        // update the commit message that will be used
        message = message.replace("8X", `8${item}`);

        // insert into agenda
        agenda[/\n() 9\. .*Action Items/, 1] = `${title}${report}\n\n`
      } else if (attach.startsWith("+")) {
        let pmc_reports = parsed.filter(section => /^[A-Z]/m.test(section.attach));
        attach = pmc_reports[pmc_reports.length - 1].attach.succ;
        let pmc = ASF.Committee.find(attach.slice(1));

        if (!pmc.dn) {
          throw new Error(`${JSON.stringify(attach.slice(1))} PMC not found`)
        };

        // select shepherd
        let shepherds = pmc_reports.map(section => section.shepherd).filter(shepherd => (
          !shepherd.includes(" ")
        )).group_by(n => n).map((n, list) => [n, list.length]);

        let min = shepherds.map((name, count) => count).min;
        let shepherd = shepherds.filter((name, count) => count === min).sample[0];

        // insert section into committee-reports
        agenda[/\n() 7\. Special Orders/, 1] = `    ${attach}. Apache ${pmc.display_name} Project [${pmc.chair.public_name} / ${shepherd}]

       See Attachment ${attach}

       [ ${pmc.display_name}.
         approved:
         comments:
         ]

`;

        // insert report text as an attachment
        agenda[/^()-+\nEnd of agenda/m, 1] = `-----------------------------------------
Attachment ${attach}: Report from the Apache ${pmc.display_name} Project  [${pmc.chair.public_name}]

${report.trim()}

`
      } else {
        let item = parsed.find(item => item.attach === attach);

        if (!item) {
          throw new Error(`Attachment ${JSON.stringify(attach)} not found`)
        } else if (digest !== item.digest) {
          throw new Error("Merge conflict")
        };

        let spacing = "\n\n";
        let pattern;

        if (/^4\w/m.test(attach)) {
          pattern = new RegExp(`(\\n\\n    ${attach[attach.length - 1]}\\. ${item.title} \\[.*?\\]).*?\\n\\n(    [B-Z]\\.| 5\\.)`, "m");
          report = report.replace(/^(.)/gm, "       $1")
        } else if (/^[78]\w/m.test(attach)) {
          title = item.fulltitle || item.title;
          pattern = new RegExp(`(^\\s+${attach[attach.length - 1]}\\.\\s+${title})\\n.*?\\n( {1,6}\\w\\.)`, "m");
          report = report.replace(/^(.)/gm, "       $1")
        } else if (attach === "8.") {
          title = "Discussion Items";
          pattern = new RegExp(`^(\\s8\\. ${title})\\n.*\\n( 9\\.)`, "m");
          report = report.replace(/^(.)/gm, "    $1")
        } else {
          pattern = new RegExp(`(---\\nAttachment ${attach}:.*?\\[.*?\\])\\n.*?\\n(-{40})`, "m");
          spacing = "\n\n\n"
        };

        if (report.length === 0) spacing = "";

        // President report has a custom footer - retain it
        if (item.title === "President" && agenda[pattern]) {
          let footer = (agenda[pattern].match(/\n\n(\s+Additionally.*?)\s+\w\.$/m) || [])[1];
          if (footer) report += `\n\n${footer}`
        };

        if (pattern.test(agenda)) {
          agenda = agenda.replace(
            pattern,
            () => `${RegExp.$1}\n\n${report}${spacing}${RegExp.$2}`
          )
        } else {
          throw new Error("report merge failed")
        }
      };

      // return updated agenda
      return agenda
    }
  );

  return {agenda: await read(agenda, request)};
}