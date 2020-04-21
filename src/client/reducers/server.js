import * as Actions from '../../actions.js';

export default function reduce(state = {}, action) {
  switch (action.type) {
    case Actions.POST_SERVER:
      return action.server;

    default:
      return state
  }
}
