import Agenda from "./agenda.js";
import Chat from "./chat.js";
import * as Events from "./events.js";
import JSONStorage from "./jsonstorage.js";

//
// Fetch, retain, and query the list of reporter drafts
//
class Reporter {
  static #$forgotten = null;

  // if digest has changed (or nothing was previously fetched) get list
  // of forgotten reports from the server
  static fetch(agenda, digest) {
    if (!Reporter.#$forgotten || Reporter.#$forgotten.digest !== digest) {
      Reporter.#$forgotten = Reporter.#$forgotten || {};

      if (!agenda || agenda === Agenda.file) {
        JSONStorage.fetch("reporter", (error, forgotten) => {
          if (!error && forgotten) {
            Chat.reporter_change(Reporter.#$forgotten, forgotten);
            Reporter.#$forgotten = forgotten
          }
        })
      }
    }
  };

  // Find the item in the forgotten drafts list.  If list has not yet
  // been fetched, download the list.
  static find(item) {
    if (Reporter.#$forgotten !== null) {
      if (Reporter.#$forgotten.agenda !== Agenda.file) return false;
      if (!/^[A-Z]+$/m.test(item.attach) || !item.stats) return false;
      let draft = Reporter.#$forgotten.drafts[item.attach];
      if (draft && draft.project === item.stats.split("?")[1]) return draft
    } else {
      this.fetch()
    }
  }
};

Events.subscribe("reporter", (message) => {
  if (message.digest) Reporter.fetch(message.agenda, message.digest)
});

export default Reporter
