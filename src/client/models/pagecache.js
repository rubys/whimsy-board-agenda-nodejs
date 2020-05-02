import Agenda from "./agenda.js";
import Help from "../pages/help.js";
import Main from "../layout/main.js";
import { Server } from "../utils.js";

//
// A cache of agenda related pages, useful for:
//
//  1) quick loading of possibly stale data, which will be updated with
//     current information as it becomes available.
//
//  2) offline access to the agenda tool
//
class PageCache {
  static #$installPrompt = null;

  // is page cache available?
  static get enabled() {
    if (typeof window.location === 'undefined') return false;

    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      return false
    };

    if (typeof ServiceWorker === 'undefined' || typeof navigator === 'undefined') {
      return false
    };

    //   # disable service workers for the production server(s) for now.  See:
    //   # https://lists.w3.org/Archives/Public/public-webapps/2016JulSep/0016.html
    //   if location.hostname =~ /^whimsy.*\.apache\.org$/
    //     unless location.hostname.include? '-test'
    //       # unregister service worker
    //       navigator.serviceWorker.getRegistrations().then do |registrations|
    //         registrations.each do |registration|
    //           registration.unregister()
    //         end
    //       end
    //
    //       return false
    //     end
    //   end
    return typeof navigator.serviceWorker !== 'undefined'
  };

  // registration and related startup actions
  static register() {
    // register service worker
    let scope = new URL("..", document.getElementsByTagName("base")[0].href);
    let swjs = `${scope}sw.js?${Server.swmtime}`;

    navigator.serviceWorker.register(swjs, scope).then(() => {
      // watch for reload requests from the service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        // ignore requests if any input or textarea element is visible
        let inputs = document.querySelectorAll("input, textarea");

        if (Math.max(...Array.from(inputs).map(element => element.offsetWidth)) <= 0) {
          if (event.data.type === "reload") {
            window.location.reload()
          } else if (event.data.type === "latest" && Main.latest) {
            this.latest(event.data.body)
          }
        }
      });

      // preload agenda and referenced pages for next requeset
      let base = document.getElementsByTagName("base")[0].href;

      navigator.serviceWorker.ready.then(registration => (
        registration.active.postMessage({
          type: "preload",
          url: base + "bootstrap.html"
        })
      ))
    });

    // fetch bootstrap from server, and update latest once it is received
    if (Main.item === Agenda && Main.latest) {
      fetch("bootstrap.html").then(response => (
        response.text().then(body => this.latest(body))
      ))
    };

    window.addEventListener("beforeinstallprompt", (event) => {
      PageCache.#$installPrompt = event;
      event.preventDefault()
    });

    this.cleanup(scope.toString(), Server.agendas)
  };

  // remove cached pages associated with agendas that are no longer present
  static cleanup(scope, agendas) {
    agendas = agendas.map(agenda => (
      (agenda.match(/\d\d\d\d_\d\d_\d\d/) || [])[0].replace(/_/g, "-")
    ));

    caches.open("board/agenda").then(cache => (
      cache.matchAll().then((responses) => {
        let urls = responses.map(response => response.url).filter((url) => {
          let part = url.slice(scope.length).split("/")[0].split(".")[0];
          return /^\d\d\d\d-\d\d-\d\d$/m.test(part) && !agendas.includes(part)
        });

        for (let url of urls) {
          cache.delete(url).then(() => {})
        }
      })
    ))
  };

  // if the entry point URL is /latest/, the service worker will optimistically
  // show the latest known agenda. If it turns out that there is a later one,
  // refresh with that page.
  static latest(body) {
    // ignore requests if any input or textarea element is visible
    let inputs = document.querySelectorAll("input, textarea");

    if (Math.max(...Array.from(inputs).map(element => element.offsetWidth)) > 0) {
      return
    };

    let latest = null;
    let data = (body.match(/"agendas":\[.*?\]/) || [])[0];
    let agenda_re = /board_agenda_\d\d\d\d_\d\d_\d\d.txt/g;
    let agenda;

    while ((agenda = agenda_re.exec(data))) {
      if (!latest || latest <= agenda[0]) latest = agenda[0]
    };

    if (latest && latest !== Agenda.file) {
      let date = (latest.match(/\d\d\d\d_\d\d_\d\d/) || [])[0].replace(
        /_/g,
        "-"
      );

      window.location.href = `../${date}/`
    }
  };

  // install prompt support
  static get installPrompt() {
    return PageCache.#$installPrompt
  };

  static set installPrompt(value) {
    PageCache.#$installPrompt = value
  }
};

export default PageCache