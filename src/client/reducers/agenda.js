import * as Actions from '../../actions.js';

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_AGENDA:
      // copy the agenda
      let agenda = action.index.map(item => ({ ...item }));

      // set up next and prev links
      let prev = null;
      for (let item of agenda) {
        item.prev = prev;
        if (prev) prev.next = item;
        prev = item;
      };
  
      // remove president attachments from the normal flow
      for (let pres of agenda) {
        if (pres.title !== "President") continue;
        console.log(pres)
        let match = pres.report?.match(/Additionally, please see Attachments (\d) through (\d)/);
        if (!match) continue;
  
        // find first and last president report; update shepherd along the way
        let first, last;
  
        for (let item of agenda) {
          if (item.attach === match[1]) first = item;
          if (first && !last) item.shepherd = item.shepherd || pres.shepherd;
          if (item.attach === match[2]) last = item
        };
  
        // remove president attachments from the normal flow
        if (first && last) { // && !Minutes.started
          first.prev.next = last.next;
          last.next.prev = first.prev;
          last.next.index = first.index;
          first.index = null;
          last.next = pres;
          first.prev = pres
        }
      };

      return agenda;

    default:
      return state
  }
}
