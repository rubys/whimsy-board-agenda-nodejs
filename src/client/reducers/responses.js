import * as Actions from '../../actions.js';

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_RESPONSES:
      return action.messages;

    default:
      return state
  }
}
