import Agenda from '../models/agenda.js';
import * as Actions from '../../actions.js';
import { splitComments } from "../utils.js";
import deepEqual from 'deep-equal';

// pending updates which have not yet been applied as they came in
// before an agenda was present.
let pending_pending = null;

// user information
let user = {};

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
        item.href = item.title.replace(/[^a-zA-Z0-9]+/g, "-");

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

        let { flagged_by, approved } = item;
        delete item.flagged_by;
        delete item.approved;
        item.status = status(state?.[item.href], { flagged_by, approved })
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

      if (pending_pending) {
        state = reduce(state, Actions.postPending(pending_pending));
        pending_pending = null;
      }

      return agenda;

    case Actions.POST_SERVER:
    case Actions.POST_PENDING:
      let pending = action.pending || action.server.pending;

      if (action.server?.user) user = action.server.user;

      if (!state) {
        pending_pending = pending
        return state;
      }

      let attachments = {};

      for (let [attachment, comments] of Object.entries(pending.comments)) {
        attachments[attachment].comments = comments;
      }

      for (let prop of ['approved', 'unapproved', 'flagged', 'unflagged']) {
        for (let attachment of pending[prop]) {
          if (!attachments[attachment]) attachments[attachment] = {};
          attachments[attachment][prop] = true;
        }
      }

      for (let item of Object.values(state)) {
        let newStatus = status(item.status, { pending: attachments[item.attach] });
        if (item.status !== newStatus) state = { ...state, [item.href]: { ...item, status: newStatus } }
      }

      return state;

    case Actions.POST_MINUTES:
      let item = Object.values(state).find(item => item.attach === action.attach);

      if (item) {
        return { ...state, [item.href]: { ...item, minutes: action.minutes } }
      }

      return state;

    default:
      return state
  }
}

function status(originalState, updates) {
  let state = originalState?.status || {};

  for (let [prop, value] of Object.entries(updates)) {
    if (value) {
      if (state[prop] !== value && !deepEqual(state[prop], value)) state = { ...state, [prop]: value };
    } else {
      if (state[prop]) {
        state = { ...state };
        delete state[prop];
      }
    }
  }

  if (state !== originalState) {
    // items are skippable if they are preapproved and not flagged  
    state.skippable = (state.approved?.length > 5) && !state.flagged_by?.length
  }

  return state;
}