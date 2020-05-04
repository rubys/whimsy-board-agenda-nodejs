import * as Actions from '../../actions.js';
import deepEqual from 'deep-equal';

export default function reduce(state = {}, action) {
  switch (action.type) {
    case Actions.POST_SERVER:

      // only update properties that actually changed
      for (let prop in action.server) {
        if (!deepEqual(state[prop], action.server[prop])) {
          state = { ...state, [prop]: action.server[prop] }
        }
      }

      return state;

    case Actions.POST_DIGEST:
      return { ...state, digest: {...state.digests, ...action.files} };

    case Actions.SET_FORKED:
      return { ...state, forked: action.state }

    default:
      return state
  }
}