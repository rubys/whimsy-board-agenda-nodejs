import { createStore, combineReducers } from 'redux';
import * as Actions from '../actions.js';
import agenda from './reducers/agenda.js';
import client from './reducers/client.js';
import clockCounter from './reducers/clock-counter.js';
import historicalComments from './reducers/historical-comments.js';
import reporter from './reducers/reporter.js';
import responses from './reducers/responses.js';
import server from './reducers/server.js';
import JSONStorage from "./models/jsonstorage.js"

// temporary staging grounds for now, will migrate into the redux store
export let file = '';
export let date = '';

let reducers = { agenda, client, clockCounter, historicalComments, reporter, responses, server };

const store = createStore(combineReducers(reducers));

// for reducers that provide lookup functions,
// load data from the server, caching it using JSONStorage, and save
// the result in the Redux store.
//
// Note that this implies that the store may be dispatched twice:
// once with slightly stale data from the client and possibly once
// again with fresh data from the server.
let fetched = {};
export function lookup(name) {
  let state = store.getState();
  if (state[name]) return state[name];

  let instructions = reducers[name]?.lookup?.(state);
  if (!instructions) return state[name];

  let { path, action, filter, initialValue } = instructions;

  if (!path) return initialValue;

  if (!fetched[path]) {
    Promise.resolve().then(() => {
      if (!action) action = Actions['post' + name.replace(/^\w/, c => c.toUpperCase())];
      if (!filter) filter = value => value;

      store.dispatch(action(initialValue));

      JSONStorage.fetch(path, (error, value) => {
        if (!error && value) store.dispatch(action(filter(value)));
      })
    });

    fetched[path] = true;
  };

  return initialValue
}

export default store;