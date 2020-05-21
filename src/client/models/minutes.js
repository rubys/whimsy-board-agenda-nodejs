import Agenda from "./agenda.js";
import * as Events from "../events.js";
import React from "react";
import { Server } from "../utils.js";

//
// This is the client model for draft Minutes.
//
class Minutes {
  static #$list = {};

  // (re)-load minutes
  static load(list) {
    Minutes.#$list = list || {};
    if (!Minutes.#$list.attendance) React.set(Minutes.#$list, "attendance", {})
  };

  // list of actions created during the meeting
  static get actions() {
    let actions = [];

    for (let [title, minutes] of Object.entries(Minutes.#$list)) {
      minutes += "\n\n";
      let pattern = /^(?:@|AI\s+)(\w+):?\s+([\s\S]*?)(\n\n|$)/gm;
      let match = pattern.exec(minutes);

      while (match) {
        actions.push({
          owner: match[1],
          text: match[2],
          item: Agenda.find(title)
        });

        match = pattern.exec(minutes)
      }
    };

    return actions
  };

  // fetch minutes for a given agenda item, by title
  static get(title) {
    return Minutes.#$list[title]
  };

  static get attendees() {
    return Minutes.#$list.attendance
  };

  static get rejected() {
    return Minutes.#$list.rejected
  };

  // return a list of actual or expected attendee names
  static get attendee_names() {
    let names = [];
    let attendance = Object.keys(Minutes.#$list.attendance);

    if (attendance.length === 0) {
      let rollcall = Minutes.get("Roll Call") || Agenda.find("Roll-Call").text;
      let pattern = /\n ( [a-z]*[A-Z][a-zA-Z]*\.?)+/g;
      let match;

      while ((match = pattern.exec(rollcall))) {
        let name = match[0].replace(/^\s+/m, "").split(" ")[0];
        if (!names.includes(name)) names.push(name)
      }
    } else {
      for (let name of attendance) {
        if (!Minutes.#$list.attendance[name].present) continue;
        name = name.split(" ")[0];
        if (!names.includes(name)) names.push(name)
      }
    };

    return names.sort()
  };

  // return a list of directors present
  static get directors_present() {
    let rollcall = Minutes.get("Roll Call") || Agenda.find("Roll-Call").text;

    return (rollcall.match(/Directors.*Present:\n\n((.*\n)*?)\n/) || [])[1].replace(
      /\n$/m,
      ""
    )
  };

  // determine if the meeting has started
  static get started() {
    return Minutes.#$list.started
  };

  // determine if the meeting is over
  static get complete() {
    return Minutes.#$list.complete
  };

  // determine if the draft is ready
  static get ready_to_post_draft() {
    return this.complete && !Server.drafts.includes(Agenda.file.replace(
      "_agenda_",
      "_minutes_"
    ))
  };

  // determine if the draft is ready
  static get draft_posted() {
    return Server.drafts.includes(Agenda.file.replace(
      "_agenda_",
      "_minutes_"
    ))
  };

  // determine if committers summary has been sent
  static get summary_sent() {
    return Minutes.#$list.todos && Minutes.#$list.todos.summary_sent
  }
};

Events.subscribe("minutes", (message) => {
  if (message.agenda === Agenda.file) Minutes.load(message.value)
});

export default Minutes