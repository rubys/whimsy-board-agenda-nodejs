import * as Actions from '../../actions.js';
import deepEqual from 'deep-equal';

export default function reduce(state = {}, action) {
  switch (action.type) {
    case Actions.POST_SERVER:

      // only update properties that actually changed
      for (let prop in action.server) {
        if (!deepEqual(state[prop], action.server[prop])) {
          state = { ...state, [prop]: action.server[prop]}
        }
      }

      return state;

    default:
      return state
  }
}