import JSONStorage from "./jsonstorage.js";

//
// Fetch, retain, and query the list of feedback responses on board@
//
class Responses {
  static #$list = null;

  static get loading() {
    return Responses.#$list && Object.keys(Responses.#$list).length === 0
  };

  static find(date, name) {
    if (Responses.#$list) {
      return Responses.#$list[date] && Responses.#$list[date][name]
    } else {
      Responses.#$list = {};
      JSONStorage.fetch("responses", (list) => {Responses.#$list = list})
    }
  }
};

export default Responses