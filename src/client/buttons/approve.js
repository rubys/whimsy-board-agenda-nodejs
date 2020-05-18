import React from "react";
import store from '../store';
import * as Actions from "../../actions.js";
import { connect } from 'react-redux';
import { post, } from "../utils.js";

function mapStateToProps(state) {
  return {
    pending: state.server.pending,
    initials: state.server.user.initials,
    agendaFile: state.client.agendaFile
  }
};

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
    let { pending, item, initials } = this.props;

    if (pending.approved.includes(item.attach)) {
      return "unapprove"
    } else if (pending.unapproved.includes(item.attach)) {
      return "approve"
    } else if (item.status.approved_by?.includes(initials)) {
      return "unapprove"
    } else {
      return "approve"
    }
  };

  // when button is clicked, send request
  click = event => {
    let data = {
      agenda: this.props.agendaFile,
      initials: this.props.initials,
      attach: this.props.item.attach,
      request: this.request
    };

    this.setState({disabled: true});

    post(
      "approve",
      data,
      pending => {
        store.dispatch(Actions.postServer({ pending }))
        this.setState({disabled: false})
      }
    )
  }
};

export default connect(mapStateToProps)(Approve)