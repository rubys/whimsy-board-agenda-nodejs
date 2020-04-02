import Agenda from "../models/agenda.js";
import Pending from "../models/pending.js";
import React from "react";
import User from "../models/user.js";

//
// Approve/Unapprove a report
//
class Approve extends React.Component {
  state = {disabled: false};

  // render a single button
  render() {
    return <button className="btn-primary btn" onClick={this.click} disabled={this.state.disabled}>{this.request}</button>
  };

  // set request (and button text) depending on whether or not the
  // not this items was previously approved
  get request() {
    if (Pending.approved.includes(this.props.item.attach)) {
      return "unapprove"
    } else if (Pending.unapproved.includes(this.props.item.attach)) {
      return "approve"
    } else if (this.props.item.approved && this.props.item.approved.includes(User.initials)) {
      return "unapprove"
    } else {
      return "approve"
    }
  };

  // when button is clicked, send request
  click = event => {
    let data = {
      agenda: Agenda.file,
      initials: User.initials,
      attach: this.props.item.attach,
      request: this.request
    };

    this.setState({disabled: true});

    Pending.update(
      "approve",
      data,
      pending => this.setState({disabled: false})
    )
  }
};

export default Approve