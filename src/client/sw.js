
//
// A service worker that bootstraps the board agenda application
//
//   *) Replace calls to fetch any agenda page with calls to fetch a bootstrap
//      page.   This page will reconstruct the page requested using cached
//      data and then request fresh data.  If the server doesn't respond
//      with 0.5 seconds or fails, return a cached version of the bootstrap
//      page.
//
//   *) When a bootstrap.html page is loaded, a scan is made for references
//      to javascripts and stylesheets, and if such a page is not present in
//      the cache, it is fetched and the results are cached.  This is because
//      browsers will sometimes try to request these pages -- even when marked
//      as immutable -- when offline.
//
//   *) Requests for javascript and stylesheets are cached and used to
//      respond to fetches that fail.  Once a new response is received,
//      old responses (with different query strings) are deleted.
//
//   *) Inform clients of the need to reload if a slow server caused
//      pages to be loaded with stale scripts and/or stylesheets
//
//   *) when requested to do so by a client, preload additional pages.  This
//      is for the initial installation, as the pages will have already been
//      loaded by the browser.
// 
/* eslint-disable no-restricted-globals */
let timeout = 500;

// install immediately
this.addEventListener("install", () => this.skipWaiting());

// take over responsibility for existing clients
// https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
this.addEventListener(
  "activate",
  event => event.waitUntil(self.clients.claim())
);

// insert or replace a response into the cache.  Delete other responses
// with the same path (ignoring the query string).
function cache_replace(cache, request, response) {
  let path = request.url.split("?")[0];

  cache.keys().then((keys) => {
    for (let key of keys) {
      if (key.url.split("?")[0] === path && key.url !== path) {
        cache.delete(key).then(() => {})
      }
    }
  });

  cache.put(request, response)
};

// broadcast a message to all clients
function broadcast(message) {
  self.clients.matchAll().then((clients) => {
    for (let client of clients) {
      client.postMessage(message)
    }
  })
};

// look for css and js files and in HTML response ensure that each are cached
/* eslint-disable no-loop-func */
function preload(cache, base, text, toolate) {
  let pattern = /"[-.\w+/]+\.(css|js)\?\d+"/g;
  let count = 0;
  let changed = false;
  let match;

  while ((match = pattern.exec(text))) {
    count++;
    let path = match[0].split("\"")[1];
    let request = new Request(new URL(path, base));

    cache.match(request).then((response) => {
      if (response) {
        count--
      } else {
        changed = true;

        fetch(request).then((response) => {
          if (response.ok) cache_replace(cache, request, response);
          count--;
          if (toolate && changed && count === 0) broadcast({type: "reload"})
        })
      }
    })
  }
};

// fetch from cache with a network fallback
function fetch_from_cache(event) {
  return caches.open("board/agenda").then(cache => (
    cache.match(event.request).then(response => (
      response || fetch(event.request).then((response) => {
        if (response.ok) cache_replace(cache, event.request, response.clone());
        return response
      })
    ))
  ))
};

// Return latest bootstrap page from the cache; then update the bootstrap
// from the server.  If the body has changed, broadcast that information to
// all the browser window clients.
function latest(event) {
  return new Promise((fulfill, reject) => (
    caches.open("board/agenda").then(cache => (
      cache.matchAll().then((responses) => {
        let match = null;

        for (let response of responses) {
          if (response.url.endsWith("/bootstrap.html")) {
            if (!match || match.url < response.url) match = response
          }
        };

        if (match) {
          match.clone().text().then((before) => {
            fulfill(match);
            let request = new Request(match.url, {cache: "no-store"});

            fetch(request).then((response) => {
              if (response.ok) {
                response.clone().text().then((after) => {
                  cache.put(request, response);
                  broadcast({type: "latest", body: after})
                })
              }
            })
          })
        } else {
          fetch(event.request).then(fulfill, reject)
        }
      })
    ))
  ))
};

// Return a bootstrap.html page within 0.5 seconds.  If the network responds
// in time, go with that response, otherwise respond with a cached version.
function bootstrap(event, request) {
  return new Promise((fulfill, reject) => {
    let timeoutId = null;

    caches.open("board/agenda").then((cache) => {
      // common logic to reply from cache
      let replyFromCache = refetch => (
        cache.match(request).then((response) => {
          clearTimeout(timeoutId);

          if (response) {
            fulfill(response);
            timeoutId = null
          } else if (refetch) {
            fetch(event.request).then(fulfill, reject)
          }
        })
      );

      // respond from cache if the server isn't fast enough
      timeoutId = setTimeout(() => replyFromCache(false), timeout);

      // attempt to fetch bootstrap.html from the network
      fetch(request).then((response) => {
        // cache the response if OK, fulfill the response if not timed out
        if (response.ok) {
          cache.put(request, response.clone());

          // preload stylesheets and javascripts
          if (/bootstrap\.html$/m.test(request.url)) {
            response.clone().text().then((text) => {
              let toolate = !timeoutId;

              setTimeout(
                () => preload(cache, request.url, text, toolate),
                toolate ? 0 : 3000
              )
            })
          };

          if (timeoutId) {
            clearTimeout(timeoutId);
            fulfill(response)
          }
        } else {
          // bad response: use cache instead
          replyFromCache(true)
        }
      }).catch(failure => replyFromCache(true))
    })
  })
};

// intercept selected pages
this.addEventListener("fetch", (event) => {
  let scope = this.registration.scope;
  let url = event.request.url;
  if (url.startsWith(scope)) url = url.slice(scope.length);

  if (event.request.method === "GET") {
    // determine what url to fetch (if any)
    if (url.endsWith("/bootstrap.html")) {
      return
    } else if (/^\d\d\d\d-\d\d-\d\d\/(\w+\/)?[-\w]*$/m.test(url)) {
      // substitute bootstrap.html for html pages
      let date = url.split("/")[0];
      let bootstrap_url = `${scope}${date}/bootstrap.html`;
      let request = new Request(bootstrap_url, {cache: "no-store"});

      // produce response
      event.respondWith(bootstrap(event, request))
    } else if (/\.(js|css)\?\d+$/m.test(url)) {
      // cache and respond to js and css requests
      event.respondWith(fetch_from_cache(event))
    } else if (url !== "") {
      // event.respondWith(Response.redirect('latest/'))
      if (url === "latest/") event.respondWith(latest(event))
    }
  }
});

// watch for preload requests
this.addEventListener("message", (event) => {
  if (event.data.type === "preload") {
    caches.open("board/agenda").then((cache) => {
      let request = new Request(event.data.url, {cache: "no-store"});

      cache.match(request).then((response) => {
        if (!response) {
          fetch(request).then((response) => {
            if (response.ok) {
              response.text().then(text => preload(cache, request.url, text, false))
            }
          })
        }
      })
    })
  }
})