import Agenda from "../models/agenda.js";
import ModalDialog from "../elements/modal-dialog.js";
import Pending from "../models/pending.js";
import React from "react";
import User from "../models/user.js";
import { jQuery } from "jquery";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    pending: state.server.pending,
    user: state.server.user
  }
};

//
// This component handles both add and edit comment actions.  The save
// button is disabled until the comment is changed.  A delete button is
// provided to clear the comment if it isn't already empty.
//
// When the save button is pushed, a POST request is sent to the server.
// When a response is received, the pending status is updated and the
// form is dismissed.
//
class AddComment extends React.Component {
  static button() {
    return {
      text: "add comment",
      class: "btn_primary",
      data_toggle: "modal",
      data_target: "#comment-form"
    }
  };

  state = {
    base: this.props.item.pending,
    comment: this.props.item.pending,
    disabled: false,
    checked: this.props.item.flagged
  };

  render() {
    return <ModalDialog id="comment-form" color="commented">
      {this.state.base ? <h4>Edit comment</h4> : <h4>Enter a comment</h4>}
      <input id="comment-initials" label="Initials" placeholder="initials" disabled={this.state.disabled} value={this.props.pending.initials || this.props.user.initials} />
      <textarea id="comment-text" value={this.state.comment} label="Comment" placeholder="comment" rows={5} disabled={this.state.disabled} />
      {User.role === "director" && /^([A-Z]+|[0-9]+)$/m.test(this.props.item.attach) ? <input id="flag" type="checkbox" label="item requires discussion or follow up" onClick={this.flag} checked={this.state.checked} /> : null}
      <button className="btn-default" data_dismiss="modal" disabled={this.state.disabled}>Cancel</button>
      {this.state.comment ? <button className="btn-warning" onClick={this.delete} disabled={this.state.disabled}>Delete</button> : null}
      <button className="btn-primary" onClick={this.save} disabled={this.state.disabled || this.state.comment === this.state.base}>Save</button>
    </ModalDialog>
  };

  mounted() {
    // update comment text to match current item
    jQuery("#comment-form").on("show.bs.modal", () => (
      this.setState({
        base: this.props.item.pending,
        comment: this.props.item.pending
      })
    ));

    // autofocus on comment text
    jQuery("#comment-form").on(
      "shown.bs.modal",
      () => document.getElementById("comment-text").focus()
    )
  };

  // when delete button is pushed, clear the comment
  delete(event) {
    this.setState({ comment: "" })
  };

  // when save button is pushed, post comment and dismiss modal when complete
  save(event) {
    let data = {
      agenda: Agenda.file,
      attach: this.props.item.attach,
      initials: document.getElementById("comment-initials").value || User.initials,
      comment: this.state.comment
    };

    this.setState({ disabled: true });

    Pending.update("comment", data, (pending) => {
      jQuery("#comment-form").modal("hide");
      document.body.classList.remove("modal-open");
      this.setState({ disabled: false });
      Pending.load(pending)
    })
  };

  flag(event) {
    this.setState({ checked: !this.state.checked });

    let data = {
      agenda: Agenda.file,
      initials: User.initials,
      attach: this.props.item.attach,
      request: event.target.checked ? "flag" : "unflag"
    };

    Pending.update("approve", data, pending => Pending.load(pending))
  }
};

export default connect(mapStateToProps)(AddComment)
