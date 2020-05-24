import React from "react";
import { post } from "../utils.js";
import Store from '../store.js';
import * as Actions from "../../actions.js";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    user: state.server.user,
    agendaFile: state.client.agendaFile
  }
};

//
// Indicate intention to attend / regrets for meeting
//
class Attend extends React.Component {
  state = { disabled: false };

  render() {
    return <button className="btn-primary btn" onClick={this.click} disabled={this.state.disabled}>{this.attending ? "regrets" : "attend"}</button>
  };

  // match person by either userid or name
  get attending() {
    if (!this.props.item.people) return false;
    let person = this.props.item.people[this.props.user.id];

    if (person) {
      return person.attending
    } else {
      for (person of Object.values(this.props.item.people)) {
        if (person.name === this.props.user.username) return person.attending
      };

      return false
    }
  };

  click = (event) => {
    let data = {
      agenda: this.props.agendaFile,
      action: this.attending ? "regrets" : "attend",
      name: this.props.user.username,
      userid: this.props.user.userid
    };

    this.setState({ disabled: true });

    post("attend", data, (response) => {
      this.setState({ disabled: false });
      if (response) Store.dispatch(Actions.postAgenda(response.agenda));
    })
  }
};

export default connect(mapStateToProps)(Attend)