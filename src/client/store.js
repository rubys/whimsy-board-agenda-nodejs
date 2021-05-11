import { createStore, combineReducers } from 'redux';
import * as Actions from '../actions.js';
import agenda from './reducers/agenda.js';
import client from './reducers/client.js';
import clockCounter from './reducers/clock-counter.js';
import historicalComments from './reducers/historical-comments.js';
import podlingNameSearch from './reducers/podling-name-search.js';
import reporter from './reducers/reporter.js';
import responses from './reducers/responses.js';
import server from './reducers/server.js';
import xref from './reducers/xref.js';
import JSONStorage from "./models/jsonstorage.js"

// temporary staging grounds for now, will migrate into the redux store
export let file = '';
export let date = '';

const reducers = {
  agenda, client, clockCounter, historicalComments,
  podlingNameSearch, reporter, responses, server, xref
};

const appReducer = combineReducers(reducers);
let fetched = {};

const rootReducer = (state, action) => {
  if (action.type === Actions.RESET_STORE) {
    state = undefined;
    fetched = {};
  }
  return appReducer(state, action);
}

let store;
if (typeof window !== 'undefined' && 'REDUX_STATE' in window) {
  // load initial state for hydration
  store = createStore(rootReducer, window.REDUX_STATE);
} else {
  // start fresh
  store = createStore(rootReducer)
}

// on the client, serverCache will forever remain null.  On the server,
// however, it will be replaced with a function which returns cached results.
let serverCache = null;
export function setCache(fn) {serverCache = fn}

// for reducers that provide lookup functions,
// load data from the server, caching it using JSONStorage, and save
// the result in the Redux store.
//
// Note that this implies that the store may be dispatched twice:
// once with slightly stale data from the client and possibly once
// again with fresh data from the server.
export function lookup(name) {
  let state = store.getState();
  if (state[name]) return state[name];

  let instructions = reducers[name]?.lookup?.(state);
  if (!instructions) return state[name];

  let { path, action, filter, initialValue } = instructions;

  if (!path) return initialValue;

  if (!fetched[path]) {
    fetched[path] = true;

    if (!action) action = Actions['post' + name.replace(/^\w/, c => c.toUpperCase())];
    if (!filter) filter = value => value;

    if (serverCache) {
      initialValue = serverCache(path) || initialValue
    } else {
      Promise.resolve().then(() => {
        JSONStorage.fetch(path, (error, value) => {
          if (!error && value) store.dispatch(action(filter(value)));
        })
      })
    };

    store.dispatch(action(initialValue));
  };

  return initialValue;
}

export default store;
