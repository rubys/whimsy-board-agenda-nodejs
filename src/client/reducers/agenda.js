import * as Actions from '../../actions.js';
import { splitComments } from "../utils.js";

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_AGENDA:
      // copy the agenda
      let agenda = action.index.map(item => ({ ...item }));

      // set up next and prev links, make various other adjustments
      let prev = null;
      for (let item of agenda) {
        // set up next and prev links
        item.prev = prev;
        if (prev) prev.next = item;
        prev = item;

        // compute hrefs
        item.href = '/' + item.title.replace(/[^a-zA-Z0-9]+/g, "-");

        // split comments
        if ('comments' in item) {
          item.comments = splitComments(item.comments)
        }

        // attach special orders related to an item to that item
        if (/^7\w/m.test(item.attach) && item.roster) {
          let order = item;
          for (let item of agenda) {
            if (item.roster === order.roster) {
              if (!item.special_orders) item.special_orders = [];
              item.special_orders.push(order);
            }
          }
        }
      };

      // remove president attachments from the normal flow
      for (let pres of agenda) {
        if (pres.title !== "President") continue;
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

    case Actions.POST_MINUTES:
      let index = state.findIndex(item => item.attach === action.attach);
      
      if (index >= 0) {
        let agenda = [...state];
        agenda[index] = {...agenda[index], minutes: action.minutes};
        return agenda
      }

      return state;

    default:
      return state
  }
}
