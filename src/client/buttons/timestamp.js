import Agenda from "../models/agenda.js";
import Minutes from "../models/minutes.js";
import React from "react";
import { post } from "../utils.js";

//
// Timestamp start/stop of meeting
//
class Timestamp extends React.Component {
  state = {disabled: false};

  render() {
    return <button className="btn-primary btn" onClick={this.click} disabled={this.state.disabled}>timestamp</button>
  };

  click = event => {
    let data = {
      agenda: Agenda.file,
      title: this.props.item.title,
      action: "timestamp"
    };

    this.setState({disabled: true});

    post("minute", data, (minutes) => {
      this.setState({disabled: false});
      Minutes.load(minutes);
      if (Minutes.complete) window.Todos.load()
    })
  }
};

export default Timestamp