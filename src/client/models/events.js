import JSONStorage from "./jsonstorage.js";
import { Server } from "../utils.js";

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
class Events {
  static #$master;
  static #$ondeck;
  static #$prefix;
  static #$timestamp;
  static #$subscriptions = {};
  static #$socket = null;

  static subscribe(event, block) {
    Events.#$subscriptions[event] = Events.#$subscriptions[event] || [];
    Events.#$subscriptions[event].push(block)
  };

  static monitor() {
    Events.#$prefix = JSONStorage.prefix;

    // pick something unique to identify this tab/window
    Events.#$timestamp = new Date().getTime() + Math.random();
    this.log(`Events id: ${Events.#$timestamp}`);

    // determine the current master (if any)
    Events.#$master = localStorage.getItem(`${Events.#$prefix}-master`);
    this.log(`Events.master: ${Events.#$master}`);

    // register as a potential candidate for master
    localStorage.setItem(
      `${Events.#$prefix}-ondeck`,
      Events.#$ondeck = Events.#$timestamp
    );

    // relinquish roles on exit
    window.addEventListener("unload", (event) => {
      if (Events.#$master === Events.#$timestamp) {
        localStorage.removeItem(`${Events.#$prefix}-master`)
      };

      if (Events.#$ondeck === Events.#$timestamp) {
        localStorage.removeItem(`${Events.#$prefix}-ondeck`)
      }
    });

    // watch for changes
    window.addEventListener("storage", (event) => {
      // update tracking variables
      if (event.key === `${Events.#$prefix}-master`) {
        Events.#$master = event.newValue;
        this.log(`Events.master: ${Events.#$master}`);
        this.negotiate()
      } else if (event.key === `${Events.#$prefix}-ondeck`) {
        Events.#$ondeck = event.newValue;
        this.log(`Events.ondeck: ${Events.#$ondeck}`);
        this.negotiate()
      } else if (event.key === `${Events.#$prefix}-event`) {
        this.dispatch(event.newValue)
      }
    });

    // dead man's switch: remove master when timestamp isn't updated
    if (Events.#$master && Events.#$timestamp - localStorage.getItem(`${Events.#$prefix}-timestamp`) > 30000) {
      this.log("Events: Removing previous master");
      Events.#$master = localStorage.removeItem(`${Events.#$prefix}-master`)
    };

    // negotiate for the role of master
    this.negotiate()
  };

  // negotiate changes in masters
  static negotiate() {
    if (Events.#$master === null && Events.#$ondeck === Events.#$timestamp) {
      this.log("Events: Assuming the role of master");

      localStorage.setItem(
        `${Events.#$prefix}-timestamp`,
        new Date().getTime()
      );

      localStorage.setItem(
        `${Events.#$prefix}-master`,
        Events.#$master = Events.#$timestamp
      );

      Events.#$ondeck = localStorage.removeItem(`${Events.#$prefix}-ondeck`);

      if (Server.session) {
        this.master()
      } else {
        let options = { credentials: "include" };
        let request = new Request("../api/session", options);

        fetch(request).then(response => (
          response.json().then((json) => {
            Server.session = json.session;
            this.master()
          })
        ))
      }
    } else if (Events.#$ondeck === null && Events.#$master !== Events.#$timestamp && !localStorage.getItem(`${Events.#$prefix}-ondeck`)) {
      localStorage.setItem(
        `${Events.#$prefix}-ondeck`,
        Events.#$ondeck = Events.#$timestamp
      )
    }
  };

  // master logic
  static master() {
    this.connectToServer(false);

    // proof of life; maintain connection to the server
    setInterval(
      () => {
        localStorage.setItem(
          `${Events.#$prefix}-timestamp`,
          new Date().getTime()
        );

        if (!Server.offline) {
          this.connectToServer(true)
        } else if (Events.#$socket) {
          Events.#$socket.close()
        }
      },

      25000
    );

    window.addEventListener("offlineStatus", (event) => {
      if (event.detail === true) {
        if (Events.#$socket) Events.#$socket.close()
      } else {
        this.connectToServer(true)
      }
    });

    // close connection on exit
    window.addEventListener("unload", (event) => {
      if (Events.#$socket) Events.#$socket.close()
    })
  };

  // establish a connection to the server
  static connectToServer(check_for_updates) {
    try {
      if (Events.#$socket) return;
      Events.#$socket = new WebSocket(Server.websocket);

      Events.#$socket.onopen = (event) => {
        Events.#$socket.send(`session: ${Server.session}\n\n`);
        this.log("WebSocket connection established");

        if (check_for_updates) {
          // see if the agenda or reporter data changed
          fetch("/api/digest", { credentials: "include" }).then((response) => {
            if (response.ok) {
              response.json().then((json) => {
                Events.broadcast({ ...json.agenda, type: "agenda" });
                Events.broadcast({ ...json.reporter, type: "reporter" })
              })
            } else {
              console.error('error fetching digest: ', response)
            }
          }).catch(console.error)
        }
      };

      Events.#$socket.onmessage = (event) => {
        localStorage.setItem(`${Events.#$prefix}-event`, event.data);
        this.dispatch(event.data)
      };

      Events.#$socket.onerror = (event) => {
        if (Events.#$socket) this.log("WebSocket connection terminated");
        Events.#$socket = null
      };

      Events.#$socket.onclose = (event) => {
        if (Events.#$socket) this.log("WebSocket connection terminated");
        Events.#$socket = null
      }
    } catch (e) {
      this.log(e)
    }
  };

  // set message to all processes
  static broadcast(event) {
    try {
      event = JSON.stringify(event);
      localStorage.setItem(`${Events.#$prefix}-event`, event);
      this.dispatch(event)
    } catch (e) {
      console.log(e);
      console.log(event)
    }
  };

  // dispatch logic (common to all tabs)
  static dispatch(data) {
    let message = JSON.parse(data);
    this.log(message);

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
        response.json().then((json) => {
          this.log(json);
          Server.session = json.session
        })
      ))
    } else if (Events.#$subscriptions[message.type]) {
      for (let sub of Events.#$subscriptions[message.type]) {
        sub(message)
      }
    };
  };

  // log messages (unless running tests)
  static log(message) {
    if (!navigator.userAgent || navigator.userAgent.includes("PhantomJS")) return;
    console.log(message)
  };

  // make the computed prefix available
  static get prefix() {
    if (Events.#$prefix) return Events.#$prefix;

    // determine localStorage variable prefix based on url up to the date
    let base = document.getElementsByTagName("base")[0].href;
    let origin = window.location.origin;

    if (!origin) {
      origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "")
    };

    Events.#$prefix = base.slice(origin.length).replace(
      /\/\d{4}-\d\d-\d\d\/.*/,
      ""
    ).replace(/^\W+|\W+$/gm, "").replace(/\W+/g, "_") || window.location.port;

    return Events.#$prefix
  }
};

export default Events