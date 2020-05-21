import * as Events from "../events.js";
import JSONStorage from "./jsonstorage.js";
import PageCache from "./pagecache.js";
import { Server, post } from "../utils.js";
import { file, date } from "../store.js";

//
// Provide a thin interface to the Server.pending data structure, and
// implement the client side of offline processing.
//
class Pending {
  static #$offline_initialized;

  // fetch pending from server (needed for ServiceWorkers)
  static fetch() {
    caches.open("board/agenda").then((cache) => {
      let fetched = false;

      let request = new Request("pending.json", {
        method: "get",
        credentials: "include",
        headers: {Accept: "application/json"}
      });

      // use data from last cache until a response is received
      cache.match(request).then((response) => {
        if (response && !fetched) response.json().then(json => Pending.load(json))
      });

      // update with the lastest once available
      fetch(request).then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());

          response.json().then((json) => {
            fetched = true;
            Pending.load(json)
          })
        }
      })
    })
  };

  static load(value) {
    Pending.initialize_offline();
    if (value) Server.pending = value;
    return value
  };

  static get count() {
    if (!Server.pending || file !== Server.pending.agenda) return 0;
    return Object.keys(this.comments).length + this.approved.length + this.unapproved.length + this.flagged.length + this.unflagged.length + Object.keys(this.status).length
  };

  static get comments() {
    if (!Server.pending || file !== Server.pending.agenda) return {};
    return Server.pending.comments || {}
  };

  static get approved() {
    if (!Server.pending || file !== Server.pending.agenda) return [];
    return Server.pending.approved || []
  };

  static get unapproved() {
    if (!Server.pending || file !== Server.pending.agenda) return [];
    return Server.pending.unapproved || []
  };

  static get flagged() {
    if (!Server.pending || file !== Server.pending.agenda) return [];
    return Server.pending.flagged || []
  };

  static get unflagged() {
    if (!Server.pending || file !== Server.pending.agenda) return [];
    return Server.pending.unflagged || []
  };

  static get seen() {
    if (!Server.pending || file !== Server.pending.agenda) return {};
    return Server.pending.seen || {}
  };

  static get status() {
    if (!Server.pending || file !== Server.pending.agenda) return [];
    return Server.pending.status || []
  };

  // find a pending status update that matches a given action item
  static find_status(action) {
    if (!Server.pending || file !== Server.pending.agenda) return null;
    let match = null;

    for (let status of Pending.status) {
      let found = true;

      for (let [name, value] of Object.entries(action)) {
        if (name !== "status" && value !== status[name]) found = false
      };

      if (found) match = status
    };

    return match
  };

  // determine if offline operatios are (or should be) supported
  static get offline_enabled() {
    if (!PageCache.enabled) return false;

    // disable offline in production for now
    //   if location.hostname =~ /^whimsy.*\.apache\.org$/
    //     return false unless location.hostname.include? '-test'
    //   end
    return true
  };

  // offline storage using IndexDB
  static dbopen(block) {
    let request = indexedDB.open("whimsy/board/agenda", 1);
    request.onerror = event => console.log("pending database not available");
    request.onsuccess = event => block(event.target.result);

    request.onupgradeneeded = (event) => {
      let db = event.target.result;
      db.createObjectStore("pending", {keyPath: "key"})
    }
  };

  // fetch pending value.  Note: callback block will not be called if there
  // is no data, or if the data is for another month's agenda
  static dbget(block) {
    this.dbopen((db) => {
      let tx = db.transaction("pending", "readonly");
      let store = tx.objectStore("pending");
      let request = store.get("pending");
      request.onerror = event => console.log("no pending data");

      request.onsuccess = event => (
        request.result && request.result.agenda === date ? block(request.result.value) : block({})
      )
    })
  };

  // update pending value.
  static dbput(value) {
    this.dbopen((db) => {
      let tx = db.transaction("pending", "readwrite");
      let store = tx.objectStore("pending");
      let request = store.put({key: "pending", agenda: date, value});
      request.onerror = event => console.log("pending write failed")
    })
  };

  // change offline status
  static setOffline(status=true) {
    Pending.initialize_offline();
    localStorage.setItem(Pending.offline_var, status.toString());
    Server.offline = status.toString() === "true";
    let event = new CustomEvent("offlineStatus", {detail: Server.offline});
    window.dispatchEvent(event)
  };

  // synchronize offline status with other windows
  static initialize_offline() {
    if (Pending.#$offline_initialized) return;
    Pending.offline_var = `${JSONStorage.prefix}-offline`;

    if (typeof localStorage !== 'undefined') {
      if (localStorage.getItem(Pending.offline_var) === "true") {
        Server.offline = true
      };

      // watch for changes
      window.addEventListener("storage", (event) => {
        if (event.key === Pending.offline_var) {
          Server.offline = event.newValue === "true";
          event = new CustomEvent("offlineStatus", {detail: Server.offline});
          window.dispatchEvent(event)
        }
      })
    };

    if (Server.offline) {
      // apply offline changes
      Pending.dbget((pending) => {
        if (pending.approve) {
          for (let [attach, request] of Object.entries(pending.approve)) {
            Pending.update("approve", {attach, request})
          }
        }
      })
    };

    Pending.#$offline_initialized = true
  };

  // apply pending update request: if offline, capture request locally, otherwise
  // post it to the server.
  static update(request, data, block) {
    if (Server.offline) {
      Pending.dbget((pending) => {
        if (request === "comment") {
          pending.comment = pending.comment || {};
          pending.comment[data.attach] = data.comment;
          Server.pending.comments[data.attach] = data.comment
        } else if (request === "approve") {
          // update list of offline requests
          if (data.request.includes("approve")) {
            pending.approve = pending.approve || {};
            pending.approve[data.attach] = data.request
          } else if (data.request.includes("flag")) {
            pending.flag = pending.flag || {};
            pending.flag[data.attach] = data.request
          };

          // apply request locally
          if (data.request === "approve") {
            let index = Server.pending.unapproved.indexOf(Server.pending.attach);
            if (index !== -1) Server.pending.unapproved.splice(index, 1);

            if (!Server.pending.approved.includes(data.attach)) {
              Server.pending.approved.push(data.attach)
            }
          } else if (data.request === "unapprove") {
            let index = Server.pending.approved.indexOf(data.attach);
            if (index !== -1) Server.pending.approved.splice(index, 1);

            if (!Server.pending.unapproved.includes(data.attach)) {
              Server.pending.unapproved.push(data.attach)
            }
          } else if (data.request === "flag") {
            let index = Server.pending.unflagged.indexOf(Server.pending.attach);
            if (index !== -1) Server.pending.unflagged.splice(index, 1);

            if (!Server.pending.flagged.includes(data.attach)) {
              Server.pending.flagged.push(data.attach)
            }
          } else if (data.request === "unflag") {
            let index = Server.pending.flagged.indexOf(data.attach);
            if (index !== -1) Server.pending.flagged.splice(index, 1);

            if (!Server.pending.unflagged.includes(data.attach)) {
              Server.pending.unflagged.push(data.attach)
            }
          }
        };

        // store offline requests
        Pending.dbput(pending);

        // inform caller, other tabs
        if (block) {
          block(Server.pending);
          Events.broadcast({type: "pending", value: Server.pending})
        }
      })
    } else {
      post(request, data, (pending) => {
        block(pending);
        Pending.load(pending)
      })
    }
  }
};

Events.subscribe("pending", message => Pending.load(message.value));
export default Pending
