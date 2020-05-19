import Minutes from "../models/minutes.js";
import ModalDialog from "../elements/modal-dialog.js";
import Pending from "../models/pending.js";
import React from "react";
import { Server, post } from "../utils.js";
import jQuery from "jquery";
import Store from '../store.js';
import * as Actions from "../../actions.js";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    user: state.server.user,
    agenda: state.agenda,
    pending: state.server.pending
  }
};

//
// Commit pending comments and approvals.  Build a default commit message,
// and allow it to be changed.
//
class Commit extends React.Component {
  static get button() {
    return {
      text: "commit",
      className: "btn-primary",
      disabled: Server.offline || Minutes.complete || Minutes.draft_posted,
      data_toggle: "modal",
      data_target: "#commit-form"
    }
  };

  state = { disabled: false };

  // commit form: allow the user to confirm or edit the commit message
  render() {
    return <ModalDialog id="commit-form" color="blank">
      <h4>Commit message</h4>
      <textarea id="commit-text" rows={5} disabled={this.state.disabled} label="Commit message"
        value={this.state.message} onChange={event => this.setState({message: event.target.value})}/>
      <button className="btn-default" data-dismiss="modal">Close</button>
      <button className="btn-primary" onClick={this.click} disabled={this.state.disabled}>Submit</button>
    </ModalDialog>
  };

  // autofocus on comment text
  componentDidMount() {
    // update message on re-display
    jQuery("#commit-form").on(
      "show.bs.modal",
      () => {
        let titles, item;
        let pending = this.props.pending;
        let messages = [];

        // common format for message lines
        let append = (title, list) => {
          if (!list) return;

          if (list.length > 0 && list.length < 6) {
            let titles = [];

            for (let item of Object.values(this.props.agenda)) {
              if (list.includes(item.attach)) titles.push(item.title)
            };

            messages.push(`${title} ${titles.join(", ")}`)
          } else if (list.length > 1) {
            messages.push(`${title} ${list.length} reports`)
          }
        };

        append("Approve", pending.approved);
        append("Unapprove", pending.unapproved);
        append("Flag", pending.flagged);
        append("Unflag", pending.unflagged);

        // list (or number) of comments made with this commit
        let comments = Object.keys(pending.comments).length;

        if (comments > 0 && comments < 6) {
          titles = [];

          for (let item of Object.values(this.props.agenda)) {
            if (pending.comments[item.attach]) titles.push(item.title)
          };

          messages.push(`Comment on ${titles.join(", ")}`)
        } else if (comments > 1) {
          messages.push(`Comment on ${comments} reports`)
        };

        // identify (or number) action item(s) updated with this commit
        if (pending.status) {
          if (pending.status.length === 1) {
            item = pending.status[0];
            let text = item.text;

            if (item.pmc || item.date) {
              text += " [";
              if (item.pmc) text += ` ${item.pmc}`;
              if (item.date) text += ` ${item.date}`;
              text += " ]"
            };

            messages.push(`Update AI: ${text}`)
          } else if (pending.status.length > 1) {
            messages.push(`Update ${pending.status.length} action items`)
          }
        };

        this.setState({ message: messages.join("\n") })
      }
    );

    jQuery("#commit-form").on(
      "shown.bs.modal",
      () => document.getElementById("commit-text").focus()
    )
  };

  // on click, disable the input fields and buttons and submit
  click = (event) => {
    this.setState({ disabled: true });

    post(
      "commit",
      { message: this.state.message, initials: this.props.user.initials },

      (response) => {
        Store.dispatch(Actions.postAgenda(response.agenda));
        Pending.load(response.pending);
        this.setState({ disabled: false });

        // delay jQuery updates to give Vue a chance to make updates first
        setTimeout(
          () => {
            jQuery("#commit-form").modal("hide");
            document.body.classList.remove("modal-open");
            jQuery(".modal-backdrop").remove()
          },

          300
        )
      }
    )
  }
};

export default connect(mapStateToProps)(Commit)
