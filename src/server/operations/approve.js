import { read } from "../sources/agenda.js";
import * as Pending from "../sources/pending.js";

//
// Pre-app approval/unapproval/flagging/unflagging of an agenda item

export default async function (request) {
  let { agenda, initials, attach } = request.body;
  let pending = await Pending.read(request);

  agenda = await read(agenda);
  initials = initials || pending.initials;
  let { approved, unapproved, flagged, unflagged } = pending;

  let index;

  switch (request.body.request) {
  case "approve":
    index = unapproved.indexOf(attach);
    if (index >= 0) unapproved.splice(index, 1);

    if (!approved.includes(attach) && !agenda.find(item => (
      item.attach == attach && item.approved.includes(initials)
    ))) approved.push(attach);

    break;

  case "unapprove":
    index = approved.indexOf(attach);
    if (index >= 0) approved.splice(index, 1);

    if (!unapproved.includes(attach) && !!agenda.find(item => (
      item.attach == attach && item.approved.includes(initials)
    ))) unapproved.push(attach);

    break;

  case "flag":
    index = unflagged.indexOf(attach);
    if (index >= 0) unflagged.splice(index, 1);

    if (!flagged.includes(attach) && !agenda.find(item => (
      item.attach == attach && Array.from(item.flagged_by).includes(initials)
    ))) flagged.push(attach);

    break;

  case "unflag":
    index = flagged.indexOf(attach);
    if (index >= 0) flagged.splice(index, 1);

    if (!unflagged.includes(attach) && !!agenda.find(item => (
      item.attach == attach && Array.from(item.flagged_by).includes(initials)
    ))) unflagged.push(attach)
  }

  return Pending.write(request, pending)
}
