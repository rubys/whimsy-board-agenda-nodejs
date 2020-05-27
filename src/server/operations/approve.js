import { update } from '../sources/pending.js'
import { read } from '../sources/agenda.js';

//
// Flag (or unflag) an agenda item
//

export default async function (request) {
  let { agenda, initials, attach } = request.body;

  let item = (await read(agenda, request)).find(item => item.attach === attach);

  return await update(request, agenda, pending => {
    pending.initials = initials;

    let { approved, unapproved, flagged, unflagged } = pending;

    let index;

    switch (request.body.request) {
      case "approve":
        index = unapproved.indexOf(attach);
        if (index !== -1) unapproved.splice(index, 1);

        if (!approved.includes(attach) && !item?.approved?.includes(initials)) {
          approved.push(attach);
        }

        break;

      case "unapprove":
        index = approved.indexOf(attach);
        if (index !== -1) approved.splice(index, 1);

        if (!unapproved.includes(attach) && item?.approved?.includes(initials)) {
          unapproved.push(attach)
        }

        break;

      case "flag":
        index = unflagged.indexOf(attach);
        if (index !== -1) unflagged.splice(index, 1);

        if (!flagged.includes(attach) && !item?.flagged_by?.includes(initials)) {
          flagged.push(attach);
        }

        break;

      case "unflag":
        index = flagged.indexOf(attach);
        if (index !== -1) flagged.splice(index, 1);

        if (!unflagged.includes(attach) && item?.flagged_by?.includes(initials)) {
          unflagged.push(attach)
        }

        break;

      default:
        throw new Error(`unexpected request: ${request.body.request}`);
    }

    return pending;
  })
}
