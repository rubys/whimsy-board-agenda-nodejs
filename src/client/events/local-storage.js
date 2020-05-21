import JSONStorage from "../models/jsonstorage.js";
import * as Actions from "../../actions.js";
import Store from "../store.js";
import * as Events from "../events.js";

//
// This adapter uses local storage to send events across browser windows.
// This approach is widely supported by browsers:
//
//   https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
//
// Down sides include the need to negotiate which window hosts the
// WebSocket connection, dealing with that window closing, aggregate
// limits on how much data can be stored in LocalStorage (and therefore,
// the maximum size of a message), polling, and race conditions.
//
//##
//
// Module variables:
// * prefix:    application prefix for localStorage variables (which are
//              shared across the domain).
// * timestamp: unique identifier for each window/tab 
// * master:    identifier of the current master
// * ondeck:    identifier of the next in line to assume the role of master
// * socket:    web socket handle
//

let $master;
let $ondeck;
let $prefix;
let $timestamp;
let $socket = null;

export function monitor(server) {
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
      negotiate(server)
    } else if (event.key === `${$prefix}-ondeck`) {
      $ondeck = event.newValue;
      console.log(`Events.ondeck: ${$ondeck}`);
      negotiate(server)
    } else if (event.key === `${$prefix}-event`) {
      Events.dispatch(event.newValue)
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
  negotiate(server)
};

// negotiate changes in masters
export function negotiate(server) {
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
    Events.dispatch(event)
  } catch (e) {
    console.log(e);
    console.log(event)
  }
};
