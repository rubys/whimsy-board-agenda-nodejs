import * as Pending from '../sources/pending.js';
import { Board } from "../svn.js";
import * as Agenda from "../sources/agenda.js";
import { reflow } from "../string-utils.js";

//
// Bulk apply comments and pre-approvals to agenda file
//
export default async function (request) {

  let { message, initials } = request.body;
  let { agenda } = await Pending.read(request);

  await Board.revise(
    agenda,
    message,
    request,

    async agenda => {
      // refetch to make sure the data is fresh (handles retries, locks, etc...)
      let updates = await Pending.read(request);
      let approved = updates.approved;
      let unapproved = updates.unapproved || [];
      let flagged = updates.flagged || [];
      let unflagged = updates.unflagged || [];
      let comments = updates.comments;
      let parsed = null;

      let patterns = {
        // Committee Reports
        "": /^\s{7}See\sAttachment\s\s?(\w+)[^\n]*?\s+\[\s[^\n]*\s*approved:\s*?(.*?)\s*comments:(.*?)\n\s{9}\]/msg,

        // Meeting Minutes
        "3": /^\s{4}(\w)\.\sThe\smeeting\sof.*?\[\s[^\n]*\s*approved:\s*?(.*?)\s*comments:(.*?)\n\s{9}\]/msg,

        // Executive Officers: only the president has comments
        "4": /^\s{4}(\w)\.\sPresident\s\[.*?\[\s*comments:()(.*?)\n\s{9}\]/msg
      };

      // iterate over patterns, matching attachments to approvals and comments
      for (let [prefix, pattern] of Object.entries(patterns)) {
        let flagged_reports = {};

        agenda = agenda.replace(pattern, (match, attachment, approvals) => {
          if (prefix) attachment = prefix + attachment;

          // add initials to the report if approved
          if (approved.includes(attachment)) {
            approvals = approvals.trim().split(/(?:,\s*|\s+)/);

            if (!approvals.includes(initials)) {
              if (approvals.length === 0) {
                match = match.replace(/approved:(\s*)\n/, line => `${line.trim()} ${initials}\n`)
              } else {
                match = match.replace(/approved:.*?()\n/, line => `${line.trim()}, ${initials}\n`)
              }
            }
          } else if (unapproved.includes(attachment)) {
            approvals = approvals.trim().split(/(?:,\s*|\s+)/);
            let index = approvals.indexOf(initials);

            if (index) {
              approvals.splice(index, 1);
              match = match.replace(/approved: (.*?)\n/, `approved: ${approvals.join(", ")}\n`)
            }
          };

          // add comments to this report
          if (comments[attachment]) {
            let indent = 13 + initials.length;
            let width = 79 - indent
            let text = reflow(comments[attachment], indent, width);
            text = initials.padStart(indent - 2) + ':' + text.slice(indent - 1);
            match = match.replace(/\n()\s{9}\]/, line => `\n${text}\n${line.slice(1)}`)
          };

          return match
        });

        // flag/unflag reports
        if (flagged.length !== 0 || unflagged.length !== 0) {
          parsed = await Agenda.parse(agenda, request);

          flagged_reports = Object.fromEntries(Array.from(
            agenda.match(/ \d\. Committee Reports.*?\n\s+A\./ms)?.[0].matchAll(/# (.*?) \[(.*)\]/g),
            ([line, pmc, flagged_by]) => [pmc, flagged_by.split(/,\s+/)]
          ));

          for (let item of parsed) {
            if (flagged.includes(item.attach)) {
              let title = item.title;
              flagged_reports[title] = flagged_reports[title] || [];

              if (!flagged_reports[title].includes(initials)) {
                flagged_reports[title].push(initials)
              }
            } else if (unflagged.includes(item.attach)) {
              let title = item.title;

              if (flagged_reports[title]) {
                delete flagged_reports[title][initials];
                if (flagged_reports[title].length === 0) delete flagged_reports[title]
              }
            }
          };

          // update flagged reports
          agenda = agenda.replace(
            / \d\. Committee Reports.*?\n\s+A\./ms,
            flags => {
              if (/discussion:\n\n()/.test(flags)) {
                flags = flags.replace(/\n +# .*? \[.*\]/g, "");

                flags.replace(/discussion:\n\n()/, match => (
                  match + Object.entries(flagged_reports).sort().map(([pmc, who]) => (
                    `        # ${pmc} [${who.join(", ")}]\n`
                  )).join()
                ));

                flags = flags.replace(/\n+(\s+)A\.$/, () => `\n\n${RegExp.$1}A.`)
              };

              return flags
            }
          )
        };

        // action item status updates
        if (updates.status) {
          parsed = parsed || await Agenda.parse(agenda, request);
          let actions = parsed.find(item => item.title === "Action Items");
          let replacement = "";

          for (let action of actions.actions) {
            // check for updates for this action item
            for (let update of updates.status) {
              let match = true;

              for (let [name, value] of Object.entries(action)) {
                if (value && name !== "status" && update[name] !== value) match = false
              };

              if (match) action = update
            };

            // format action item
            replacement += `* ${action.owner}: ${action.text}\n`;

            if (action.date || action.pmc) {
              replacement += "      [";
              if (action.pmc) replacement += ` ${action.pmc}`;
              if (action.date) replacement += ` ${action.date}`;
              replacement += " ]\n"
            };

            replacement += "      Status:";
            if (action.status.length !== 0) replacement += ` ${action.status}`;
            replacement += "\n\n";
          };

          // replace entire section
          agenda = agenda.replace(/^( ?\d+\. Review Outstanding Action Items\n\n)(.*?\n\n)(\s?\d)/ms,
            `$1${replacement.replace(/^(.)/gm, "    $1")}$3`)
        }
      };

      // apply operations comments to the President's report
      let operations = agenda.match(/\s*Additionally, please see Attachments (\d) through (\d)\./).slice(1, 3).map(parseInt);

      for (let i = operations[0]; i <= operations[1]; i++) {
        let attachment = i.toString();

        if (comments.includes(attachment)) {
          let office = agenda.match(new RegExp(`^Attachment ${attachment}: Report from the (.*?)  \\[`, "m"))?.[1];
          office = office.replace(/^VP of /m, "");
          office = office.replace(/^Apache /m, "");
          let width = 79 - 13 - initials.length;
          let text = `[${office}] ${comments[attachment]}`;
          text = reflow(text, 13 + initials.length, width);
          text = initials + text.slice(initials.length);

          agenda = agenda.replace(patterns["4"], (match) => {
            return match.replace(/\n()\s{9}\]/, line => `\n${text}\n${line.slice(1)}`);
          })
        }
      };

      // return updated agenda
      return agenda
    }
  );

  // backup and clear out the pending changes
  await Pending.backup(request);
  await Pending.write(request, { agenda, initials });

  return {
    agenda: await Agenda.read(agenda, request),
    pending: await Pending.read(request)
  }
}
