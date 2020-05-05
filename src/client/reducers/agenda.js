import Agenda from '../models/agenda.js';
import * as Actions from '../../actions.js';
import { splitComments } from "../utils.js";

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_AGENDA:
      // scaffolding: load legacy model until it can be safely removed
      Agenda.load(action.index);

      // copy the agenda
      let agenda = action.index.map(item => ({ ...item }));

      // set up next and prev links, make various other adjustments
      let prev = null;
      agenda.forEach((item, index) => {
        item.sortOrder = index;

        // compute href
        item.href = '/' + item.title.replace(/[^a-zA-Z0-9]+/g, "-");

        // set up next and prev links
        item.prev = prev?.href;
        if (prev) prev.next = item.href;
        prev = item;

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
      });

      // remove president attachments from the normal flow
      let pres = agenda.find(item => item.title === "President");
      let match = pres?.report?.match(/Additionally, please see Attachments (\d) through (\d)/);

      // find first and last president report; update shepherd along the way
      let first, last;
      if (match) {
        for (let item of agenda) {
          if (item.attach === match[1]) first = item;
          if (first && !last) item.shepherd = item.shepherd || pres.shepherd;
          if (item.attach === match[2]) last = item
        }
      }

      // convert to an object, indexed by href
      agenda = Object.fromEntries(agenda.map(item => [item.href, item]))

      // remove president attachments from the normal flow
      if (first && last) { // && !Minutes.started
        agenda[first.prev].next = last.next;
        agenda[last.next].prev = first.prev;
        agenda[last.next].index = first.index;
        first.index = null;
        last.next = pres;
        first.prev = pres
      }

      return agenda;

    case Actions.POST_MINUTES:
      let item = Object.values(state).find(item => item.attach === action.attach);

      if (item) {
        return { ...state, [item.href]: { ...item, minutes: action.minutes }}       
      }

      return state;

    default:
      return state
  }
}
