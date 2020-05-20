import JSONStorage from "./jsonstorage.js";
import * as Actions from "../../actions.js";
import Store from "../store.js";

//
// Motivation: browsers limit the number of open web socket connections to any
// one host to somewhere between 6 and 250, making it impractical to have one
// Web Socket per tab.
//
// The solution below uses localStorage to communicate between tabs, with
// the majority of logic involved with the "election" of a master.  This
// enables a single open connection to service all tabs open by a browser.
//
// Alternatives include: 
//
// * Replacing localStorage with Service Workers.  This would be much cleaner,
//   unfortunately Service Workers aren't widely deployed yet.  Sadly, the
//   state isn't much better for Shared Web Workers.
//
//##
//
// Class variables:
// * prefix:    application prefix for localStorage variables (which are
//              shared across the domain).
// * timestamp: unique identifier for each window/tab 
// * master:    identifier of the current master
// * ondeck:    identifier of the next in line to assume the role of master
//

let $master;
let $ondeck;
let $prefix;
let $timestamp;
let $subscriptions = {};
let $socket = null;

export function subscribe(event, block) {
  $subscriptions[event] = $subscriptions[event] || [];
  $subscriptions[event].push(block)
};

export function monitor() {
  $prefix = JSONStorage.prefix;

  // pick something unique to identify this tab/window
  $timestamp = new Date().getTime() + Math.random();
  console.log(`Events id: ${$timestamp}`);

  // determine the current master (if any)
  $master = localStorage.getItem(`${$prefix}-master`);
  console.log(`Events.master: ${$master}`);

  // register as a potential candidate for master
  localStorage.setItem(
    `${$prefix}-ondeck`,
    $ondeck = $timestamp
  );

  // relinquish roles on exit
  window.addEventListener("unload", (event) => {
    if ($master === $timestamp) {
      localStorage.removeItem(`${$prefix}-master`)
    };

    if ($ondeck === $timestamp) {
      localStorage.removeItem(`${$prefix}-ondeck`)
    }
  });

  // watch for changes
  window.addEventListener("storage", (event) => {
    // update tracking variables
    if (event.key === `${$prefix}-master`) {
      $master = event.newValue;
      console.log(`Events.master: ${$master}`);
      negotiate()
    } else if (event.key === `${$prefix}-ondeck`) {
      $ondeck = event.newValue;
      console.log(`Events.ondeck: ${$ondeck}`);
      negotiate()
    } else if (event.key === `${$prefix}-event`) {
      dispatch(event.newValue)
    } else if (event.key === `${$prefix}-probe`) {
      if ($master) {
        localStorage.setItem(
          `${$prefix}-timestamp`,
          new Date().getTime()
        );
      }
    }
  });

  // dead man's switch: remove master when timestamp isn't updated
  if ($master && $timestamp - localStorage.getItem(`${$prefix}-timestamp`) > 30_000) {
    console.log("Events: Removing previous master");
    $master = localStorage.removeItem(`${$prefix}-master`)
  };

  // negotiate for the role of master
  negotiate()
};

// negotiate changes in masters
export function negotiate() {
  if ($master === null && $ondeck === $timestamp) {
    console.log("Events: Assuming the role of master");

    localStorage.setItem(
      `${$prefix}-timestamp`,
      new Date().getTime()
    );

    localStorage.setItem(
      `${$prefix}-master`,
      $master = $timestamp
    );

    $ondeck = localStorage.removeItem(`${$prefix}-ondeck`);

    let { server } = Store.getState();

    if (server && server.session) {
      master(server)
    } else {
      let options = { credentials: "include" };
      let request = new Request("../api/server", options);

      fetch(request).then(response => (
        response.json().then(server => {
          Store.dispatch(Actions.postServer(server));
          master(server)
        })
      ))
    }
  } else if ($ondeck === null && $master !== $timestamp && !localStorage.getItem(`${$prefix}-ondeck`)) {
    localStorage.setItem(
      `${$prefix}-ondeck`,
      $ondeck = $timestamp
    )
  } else {
    localStorage.setItem(
      `${$prefix}-probe`,
      $timestamp
    )
  }
};

// master logic
export function master(server) {
  connectToServer(server);

  let ts = 0;

  // proof of life; maintain connection to the server
  setInterval(
    () => {
      if (new Date().getTime() - ts > 25_000) {
        ts = new Date().getTime();
        localStorage.setItem(`${$prefix}-timestamp`, ts);
      }

      let { server } = Store.getState();

      if (!server.offline) {
        connectToServer(server);
      } else if ($socket) {
        $socket.close()
      }
    },

    (server.env === 'development' ? 500 : 25_000)
  );

  window.addEventListener("offlineStatus", (event) => {
    if (event.detail === true) {
      if ($socket) $socket.close()
    } else {
      let { server } = Store.getState();
      connectToServer(server)
    }
  });

  // close connection on exit
  window.addEventListener("unload", (event) => {
    if ($socket) $socket.close()
  })
};

// establish a connection to the server
export function connectToServer({ websocket, session }) {
  try {
    if ($socket) return;
    $socket = new WebSocket(websocket);

    $socket.onopen = (event) => {
      $socket.send(`session: ${session}\n\n`);
      console.log("WebSocket connection established");
    };

    $socket.onmessage = (event) => {
      broadcast(event.data);
    };

    $socket.onerror = (event) => {
      if ($socket) console.log("WebSocket connection terminated");
      $socket = null
    };

    $socket.onclose = (event) => {
      if ($socket) console.log("WebSocket connection terminated");
      $socket = null
    }
  } catch (e) {
    console.log(e)
  }
};

// set message to all processes
export function broadcast(event) {
  try {
    if (typeof event !== 'string') event = JSON.stringify(event);
    localStorage.setItem(`${$prefix}-event`, event);
    dispatch(event)
  } catch (e) {
    console.log(e);
    console.log(event)
  }
};

// dispatch logic (common to all tabs)
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
  } else if ($subscriptions[message.type]) {
    for (let sub of $subscriptions[message.type]) {
      sub(message)
    }
  };
};

// make the computed prefix available
export function prefix() {
  if ($prefix) return $prefix;

  // determine localStorage variable prefix based on url up to the date
  let base = document.getElementsByTagName("base")[0].href;
  let origin = window.location.origin;

  if (!origin) {
    origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "")
  };

  $prefix = base.slice(origin.length).replace(
    /\/\d{4}-\d\d-\d\d\/.*/,
    ""
  ).replace(/^\W+|\W+$/gm, "").replace(/\W+/g, "_") || window.location.port;

  return $prefix
};
