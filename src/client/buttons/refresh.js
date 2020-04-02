import Agenda from "../models/agenda.js";
import React from "react";
import { Server, post } from "../utils.js";

//
// A button that will do a 'svn update' of the agenda on the server
//
class Refresh extends React.Component {
  state = {disabled: false};

  render() {
    return <button className="btn-primary btn" onClick={this.click} disabled={this.state.disabled || Server.offline}>refresh</button>
  };

  click = (event) => {
    this.setState({disabled: true});

    post("refresh", {agenda: Agenda.file}, (response) => {
      this.setState({disabled: false});
      Agenda.load(response.agenda, response.digest)
    })
  }
};

export default Refresh