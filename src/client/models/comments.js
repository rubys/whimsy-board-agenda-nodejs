import JSONStorage from "./jsonstorage.js";
import { Server } from "../utils.js";

//
// Fetch, retain, and query the list of historical comments
//
class HistoricalComments {
  static #$comments = null;

  // find historical comments based on report title
  static find(title) {
    if (HistoricalComments.#$comments) {
      return HistoricalComments.#$comments[title]
    } else {
      HistoricalComments.#$comments = {};

      JSONStorage.fetch("historical-comments", (comments) => {
        HistoricalComments.#$comments = comments || {}
      })
    }
  };

  // find link for historical comments based on date and report title
  static link(date, title) {
    if (Server.agendas.includes(`board_agenda_${date}.txt`)) {
      return `../${date.replace(/_/g, "-")}/${title}`
    } else {
      return `../../minutes/${title}.html#minutes_${date}`
    }
  }
};

export default HistoricalComments