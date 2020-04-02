import JSONStorage from "./jsonstorage.js";

//
// Fetch, retain, and query the list of JIRA projects
//
class JIRA {
  static #$list = null;

  static find(name) {
    if (JIRA.#$list) {
      return JIRA.#$list.includes(name)
    } else {
      JIRA.#$list = [];
      JSONStorage.fetch("jira", (list) => {JIRA.#$list = list})
    }
  }
};

export default JIRA