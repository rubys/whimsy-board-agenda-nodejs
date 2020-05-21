import JSONStorage from "./models/jsonstorage.js";
import * as Actions from "../actions.js";
import Store from "./store.js";

//
// Motivation: browsers limit the number of open web socket connections to any
// one host to somewhere around 6, making it impractical to have one WebSocket
// per tab.
//
// There are a number of ways to communicate between tabs, unfortunately not
// all browsers implement the necessary functions.  Hence, an adapter approch
// is taken, using only the support that is available.

import * as LocalStorageAdapter from "./events/local-storage-adapter.js";
import * as SharedWorkerAdapter from "./events/shared-worker-adapter.js";

let subscriptions = {};
let adapter = LocalStorageAdapter;

if (SharedWorkerAdapter.available) {
  adapter = SharedWorkerAdapter;
}

export function monitor(server) {
  adapter.monitor(server);
}

export function broadcast(message) {
  adapter.broadcast(message);
}

export function subscribe(event, callback) {
  subscriptions[event] = subscriptions[event] || [];
  subscriptions[event].push(callback)
};

// dispatch logic (common to all adapters/tabs)
export function dispatch(data) {
  let message = JSON.parse(data);
  console.log(message);

  if (message.type === 'reload') {
    // ignore requests if any input or textarea element is visible
    let inputs = document.querySelectorAll("input, textarea");

    if (Math.max(...Array.from(inputs).map(element => element.offsetWidth)) <= 0) {
      window.location.reload()
    }

  } else if (message.type === "unauthorized") {
    let options = { credentials: "include" };
    let request = new Request("../session.json", options);

    fetch(request).then(response => (
      response.json().then((server) => {
        console.log(server);
        Store.dispatch(Actions.postServer(server));
      })
    ))

  } else if (message.type === "digest") {
    let { server: { digests = {} }, client: { agendaFile, meetingDate } } = Store.getState();

    for (let file in message.files) {
      if (digests[file] && digests[file] !== message.files[file]) {
        console.log("changed: ", file, digests[file], message.files[file]);

        if (`${file}.txt` === agendaFile) {
          // fetch and store agenda information
          JSONStorage.fetch(`${meetingDate}.json`, (error, agenda) => {
            if (!error && agenda) {
              Store.dispatch(Actions.postAgenda(agenda));
            }
          })
        }
      }
    }

    Store.dispatch(Actions.postDigest(message.files))

  } else if (message.type === "work-update" && message.eventType === "update") {

    let { server: { user: { userid } } } = Store.getState();

    if (message.fileName === `agenda/${userid}.yml`) {
      // fetch and store server information (which contains pending)
      JSONStorage.fetch(`server`, (error, server) => {
        if (!error && server) {
          Store.dispatch(Actions.postServer(server));
        }
      })
    }

  } else if (Actions[message.type]) {
    Store.dispatch(message);

  } else if (subscriptions[message.type]) {
    for (let sub of subscriptions[message.type]) {
      sub(message)
    }
  };
};
