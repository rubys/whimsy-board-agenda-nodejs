import { createStore } from 'redux';
import * as Actions from '../actions.js';
import JSONStorage from "./models/jsonstorage.js"

// temporary staging grounds for now, will migrate into the redux store
export let file = '';
export let date = '';

// now for the real stuff
function reduce(state, action) {
  switch (action.type) {
    case Actions.CLOCK_INCREMENT:
      return { ...state, clock_counter: state.clock_counter + 1 };

    case Actions.CLOCK_DECREMENT:
      return { ...state, clock_counter: state.clock_counter - 1 };

    case Actions.POST_AGENDA:
      return { ...state, agenda: action.index };

    case Actions.POST_SERVER:
      return { ...state, server: action.server };

    case Actions.HISTORICAL_COMMENTS:
      return { ...state, historicalComments: action.comments };

    case Actions.RESPONSES:
      return { ...state, responses: action.messages }

    default:
      return state;
  }
}

const store = createStore(reduce, {
  clock_counter: 0
});

// load data from the server, caching it using JSONStorage, and save
// the result in the Redux store.
//
// Note that this implies that the store may be dispatched twice:
// once with slightly stale data from the client and possibly once
// again with fresh data from the server.
export function lookup({ name, path, action, initialValue }) {
  let state = store.getState();

  if (!name) name=path.replace(/-\w/g, (data => data[1].toUpperCase()));
  if (!action) action = Actions[name];

  if (name in state) {
    return state[name];
  } else {
    store.dispatch(action(initialValue));
    JSONStorage.fetch(path, value => {
      if (value) store.dispatch(action(value));
    })
  };

  return initialValue
}

export default store;