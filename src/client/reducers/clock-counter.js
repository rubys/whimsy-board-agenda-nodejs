import * as Actions from '../../actions.js';

export default function reduce(state = 0, action) {
  switch (action.type) {
    case Actions.CLOCK_INCREMENT:
      return state + 1;

    case Actions.CLOCK_DECREMENT:
      return state - 1;

    default:
      return state
  }
}
