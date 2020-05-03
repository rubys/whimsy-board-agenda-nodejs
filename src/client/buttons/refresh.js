import Agenda from "../models/agenda.js";
import React from "react";
import { post } from "../utils.js";
import { connect } from 'react-redux';
import store from '../store';
import * as Actions from "../../actions.js";

//
// A button that will do a 'svn update' of the agenda on the server
//

function mapStateToProps(state) {
  return {
    offline: state.client.offline,
    forked: state.server.forked,
  }
};

class Refresh extends React.Component {
  state = { disabled: false };

  render() {
    let disabled = this.state.disabled || this.props.offline;
    let label = this.props.forked ? 'reset' : 'refresh';

    return <button className="btn-primary btn" onClick={this.click} disabled={disabled}>{label}</button>
  };

  click = (event) => {
    this.setState({ disabled: true });

    post("refresh", { agenda: Agenda.file }, response => {
      this.setState({ disabled: false });
      store.dispatch(Actions.postAgenda(response.agenda))
    })
  }
};

export default connect(mapStateToProps)(Refresh)