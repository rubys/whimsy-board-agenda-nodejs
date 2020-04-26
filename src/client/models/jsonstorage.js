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

  // retrieve an cached object.  Note: block may be dispatched twice,
  // once with slightly stale data and once with current data
  //
  // Note: caches only work currently on Firefox and Chrome.  All
  // other browsers fall back to XMLHttpRequest (AJAX).
  static fetch(name, block) {
    if (typeof fetch !== 'undefined' && typeof caches !== 'undefined' && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
      caches.open("board/agenda").then((cache) => {
        let fetched = null;
        Store.dispatch(Actions.clockIncrement());

        // construct request
        let request = new Request(`../api/${name}`, {
          method: "get",
          credentials: "include",
          headers: { Accept: "application/json" }
        });

        // dispatch request
        fetch(request).then((response) => {
          cache.put(request, response.clone());

          response.json().then(json => {
            if (!fetched || JSON.stringify(fetched) !== JSON.stringify(json)) {
              if (!fetched) Store.dispatch(Actions.clockDecrement());
              fetched = json;
              if (json) block(json)
            }
          })
            .catch(error => {
              console.error(`fetch ${request.url}:\n${error}`)
            })
            .finally(() => {
              if (!fetched) Store.dispatch(Actions.clockDecrement());
            })
        });

        // check cache
        cache.match(`../api/${name}`).then(response => {
          if (response && !fetched) {
            try {
              response.json().then(json => {
                Store.dispatch(Actions.clockDecrement());
                fetched = json;
                if (json) block(json)
              })
            } catch (error) {
              if (error.name !== 'SyntaxError') throw error;
            }
          }
        })
      })
    } else if (typeof XMLHttpRequest !== 'undefined') {
      // retrieve from the network only
      retrieve(name, "json", block)
    }
  }
};

export default JSONStorage
