import Agenda from "../models/agenda.js";
import Pending from "../models/pending.js";
import React from "react";
import { post } from "../utils.js";

//
// A button that mark all comments as 'seen', with an undo option
//
class MarkSeen extends React.Component {
  static undo = null;

  state = {disabled: false, label: "mark seen"};

  render() {
    return <button className="btn-primary btn" onClick={this.click} disabled={this.state.disabled}>{this.state.label}</button>
  };

  click = event => {
    let seen;
    this.setState({disabled: true});

    if (MarkSeen.undo) {
      seen = MarkSeen.undo
    } else {
      seen = {};

      for (let item of Agenda.index) {
        if (item.comments && item.comments.length !== 0) {
          seen[item.attach] = item.comments
        }
      }
    };

    post("markseen", {seen, agenda: Agenda.file}, (pending) => {
      this.setState({disabled: false});

      if (MarkSeen.undo) {
        MarkSeen.undo = null;
        this.setState({label: "mark seen"})
      } else {
        MarkSeen.undo = Pending.seen;
        this.setState({label: "undo mark"})
      };

      Pending.load(pending)
    })
  }
};

export default MarkSeen