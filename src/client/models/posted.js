import JSONStorage from "./jsonstorage.js";

// Posted PMC reports - see https://whimsy.apache.org/board/posted-reports
class Posted {
  static #$list = [];
  static #$fetched = false;

  static get(title) {
    let results = [];

    // fetch list of reports on first reference
    if (!Posted.#$fetched) {
      Posted.#$list = [];
      JSONStorage.fetch("posted-reports", (list) => {Posted.#$list = list});
      Posted.#$fetched = true
    };

    // return list of matching reports
    for (let entry of Posted.#$list) {
      if (entry.title === title) results.push(entry)
    };

    return results
  }
};

export default Posted