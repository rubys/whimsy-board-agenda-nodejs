import { retrieve } from "../utils.js";
import Store from "../store.js";
import * as Actions from "../../actions.js";

//
// Originally defined to simplify access to sessionStorage for JSON objects.
//
// Now expanded to include caching using fetch and the cache defined in
// the Service Workers specification (but without the user of SWs).
//
class JSONStorage {
  static #$prefix;

  // determine sessionStorage variable prefix based on url up to the date
  static get prefix() {
    if (JSONStorage.#$prefix) return JSONStorage.#$prefix;
    let base = document.getElementsByTagName("base")[0].href;
    let origin = window.location.origin;

    if (!origin) {
      origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "")
    };

    JSONStorage.#$prefix = base.slice(origin.length).replace(
      /\/\d{4}-\d\d-\d\d\/.*/,
      ""
    ).replace(/^\W+|\W+$/gm, "").replace(/\W+/g, "_") || window.location.port;

    return JSONStorage.#$prefix
  };

  // store an item, converting it to JSON
  static put(name, value) {
    name = JSONStorage.prefix + "-" + name;

    try {
      sessionStorage.setItem(name, JSON.stringify(value))
    } catch (e) {

    };
    return value
  };

  // retrieve an item, converting it back to an object
  static get(name) {
    if (typeof sessionStorage !== 'undefined') {
      name = JSONStorage.prefix + "-" + name;
      return JSON.parse(sessionStorage.getItem(name) || "null")
    }
  };

  // retrieve a cached object.  If onlyFinal is true, callback will only be
  // called with fresh data received from the server.  Otherwise callback may
  // be dispatched twice, once with slightly stale data and once with current
  // data if it is different.
  static fetch(name, callback, onlyFresh=false) {
    if (typeof fetch !== 'undefined' && typeof caches !== 'undefined' && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
      caches.open("board/agenda").then((cache) => {
        let fetched = undefined;
        Store.dispatch(Actions.clockIncrement());

        // construct request
        let request = new Request(`../api/${name}`, {
          method: "get",
          credentials: "include",
          headers: { Accept: "application/json" }
        });

        // dispatch request
        fetch(request).then((response) => {
          if (!response.ok) throw response.statusText;
          cache.put(request, response.clone());

          response.json().then(json => {
            if (fetched === undefined || JSON.stringify(fetched) !== JSON.stringify(json)) {
              if (fetched === undefined) Store.dispatch(Actions.clockDecrement());
              fetched = json;
              callback(null, json, true)
            }
          })
            .catch(error => {
              console.error(`fetch ${request.url}:\n${error}`)
            })
            .finally(() => {
              if (fetched === undefined) Store.dispatch(Actions.clockDecrement());
            })
        });

        // check cache
        if (!onlyFresh) {
          cache.match(`../api/${name}`).then(response => {
            if (response && fetched === undefined) {
              try {
                response.json().then(json => {
                  if (fetched === undefined) Store.dispatch(Actions.clockDecrement());
                  if (json) {
                    callback(null, json, false)
                    fetched = json;
                  }
                })
              } catch (error) {
                if (error.name !== 'SyntaxError') callback(error);
              }
            }
          })
        }
      })
    } else if (typeof XMLHttpRequest !== 'undefined') {
      // retrieve from the network only
      retrieve(name, "json", data => callback(null, data, true))
    }
  }
};

export default JSONStorage
