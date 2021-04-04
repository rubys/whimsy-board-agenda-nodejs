//
// Post list of action items
//
import { Board } from "../svn.js";
import { reflow } from "../string-utils.js";
import { parse } from "../sources/agenda.js";

export default async function postActions(request) {
  let { agenda, message, actions } = request.body;

  agenda = await Board.revise(
    agenda,
    message,
    request,

    async agenda => {
      // render all uncompleted actions
      let text = "";

      for (let action of actions) {
        if (action.complete) continue;

        // reflow lines
        let lines = reflow(`* ${action.owner}: ${action.text}`, 0, 78).split("\n");
        text += lines.shift() + "\n";
        if (lines.length !== 0) text += reflow(lines.join("\n"), 6, 72) + "\n";

        // add pmc, date, if present
        if (action.pmc?.toString().length) {
          if (action.date?.toString().length) {
            text += `      [ ${action.pmc} ${action.date} ]\n`
          } else {
            text += `      [ ${action.pmc} ]\n`
          }
        } else if (action.date.toString().length !== 0) {
          text += `      [ ${action.date} ]\n`
        };

        // add pmc, date, if present
        text += "      Status:\n\n"
      };

      // insert into the agenda
      agenda = agenda.replace(
        /^(\s+\d+\.\sReview\sOutstanding\sAction\sItems\n\n)(.*?)(\s*\d+\.\sUnfinished\sBusiness)/ms,
        `$1${text.replace(/^(.)/gm, "    $1")}$3`
      );

      // return updated agenda
      return agenda
    }
  );

  return parse(agenda);
}
