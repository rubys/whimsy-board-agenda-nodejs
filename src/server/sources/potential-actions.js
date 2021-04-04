import { Board } from "../svn.js";
import * as Agenda from './agenda.js';
import * as Minutes from './minutes.js';
import { reflow } from "../string-utils.js";

//
// potential actions
//
// get posted action items from previous report
export default async function potentialActions(request) {
  let base = (await Board.agendas()).slice(-2)[0];
  let parsed = await Agenda.read(base);

  let actions = parsed.find(item => item.title === "Action Items").actions;

  // scan draft minutes for new action items
  let pattern = /^(?:@|AI\s+)(\w+):?\s+([\s\S]*?)(?:\n\n|$)/msg;
  let date = base.match(/\d{4}_\d\d_\d\d/)?.[0].replace(/_/g, "-");

  let minutes = await Minutes.read(base, request);

  for (let [title, secnotes] of Object.entries(minutes.items)) {
    if (typeof secnotes !== 'string') continue;

    for (let [owner, text] of Array.from(
      secnotes.matchAll(pattern),
      s => s.slice(1)
    )) {
      text = reflow(text, 6, 72).trim();
      actions.push({ owner, text, status: null, pmc: title, date })
    }
  };

  // get names from roll call info
  let roll = parsed.find(item => item.title === "Roll Call").people;
  let names = [...new Set(Object.values(roll).map(person => person.name.split(' ')[0])).values()].sort()

  return { date,actions,names }
}
