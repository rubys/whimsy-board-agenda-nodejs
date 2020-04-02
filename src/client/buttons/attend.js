import Agenda from "../models/agenda.js";
import React from "react";
import User from "../models/user.js";
import { post } from "../utils.js";

//
// Indicate intention to attend / regrets for meeting
//
class Attend extends React.Component {
  state = {disabled: false};

  render() {
    return <button className="btn-primary btn" onClick={this.click} disabled={this.state.disabled}>{this.attending ? "regrets" : "attend"}</button>
  };

  // match person by either userid or name
  get attending() {
    if (!this.props.item.people) return false;
    let person = this.props.item.people[User.id];

    if (person) {
      return person.attending
    } else {
      for (person of this.props.item.people) {
        if (person.name === User.username) return person.attending
      };

      return false
    }
  };

  click = (event) => {
    let data = {
      agenda: Agenda.file,
      action: this.attending ? "regrets" : "attend",
      name: User.username,
      userid: User.id
    };

    this.setState({disabled: true});

    post("attend", data, (response) => {
      this.setState({disabled: false});
      Agenda.load(response.agenda, response.digest)
    })
  }
};

export default Attend