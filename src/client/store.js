import { createStore } from 'redux';
import * as Actions from '../actions.js';

// temporary staging grounds for now, will migrate into the redux store
export let file = '';
export let date = '';

// now for the real stuff
function reduce(state, action) {
  console.log(state);
  switch (action.type) {
    case Actions.CLOCK_INCREMENT:
      return { ...state, clock_counter: state.clock_counter + 1 }

    case Actions.CLOCK_DECREMENT:
      return { ...state, clock_counter: state.clock_counter - 1 }

    default:
      return state;
  }
}

const store = createStore(reduce, {
  clock_counter: 0
});

export default store;