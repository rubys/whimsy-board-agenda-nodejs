import * as Actions from '../../actions.js';
import deepEqual from 'deep-equal';

export default function reduce(state = {}, action) {
  switch (action.type) {
    case Actions.POST_SERVER:

      // only update properties that actually changed
      for (let prop in action.server) {
        if (!deepEqual(state[prop], action.server[prop])) {
          if (prop === 'pending') {
            state = reduce(state, Actions.postPending(action.server.pending))
          } else {
            state = { ...state, [prop]: action.server[prop] }
          }
        }
      }

      return state;

    case Actions.POST_PENDING:
      let pending = { ...action.pending };

      pending.count =
        Object.keys(pending.comments || {}).length +
        pending.approved?.length || 0 +
        pending.unapproved?.length || 0 +
        pending.flagged?.length || 0 +
        pending.unflagged?.length || 0 +
        pending.status?.length || 0;

      if (!deepEqual(action.pending, state.pending)) {
        return { ...state, pending }
      }
  
      return state;

    case Actions.POST_DIGEST:
      return { ...state, digests: { ...state.digests, ...action.files } };

    case Actions.SET_FORKED:
      return { ...state, forked: action.state }

    case Actions.SET_ROLE:
      return { ...state, user: { ...state.user, role: action.role }}

    default:
      return state
  }
}
