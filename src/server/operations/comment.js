import { update } from '../sources/pending.js'

//
// Add comments to an agenda item
//

export default async function comment(request) {
  let {agenda, initials, comment, attach} = request.body;

  return update(request, agenda, pending => {
    pending.initials = initials;

    if (!comment || comment.trim() === '') {
      delete pending.comments[attach];
    } else {
      pending.comments[attach] = comment;
    }

    return pending;
  })
}
