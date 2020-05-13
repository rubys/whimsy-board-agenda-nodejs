import ModalDialog from "../elements/modal-dialog.js";
import Pending from "../models/pending.js";
import React from "react";
import jQuery from "jquery";
import { connect } from 'react-redux';
import Store from '../store.js';
import * as Actions from "../../actions.js";

function mapStateToProps(state) {
  return {
    agendaFile: state.client.agendaFile,
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
  static get button() {
    return {
      text: "add comment",
      className: "btn-primary",
      data_toggle: "modal",
      data_target: "#comment-form"
    }
  };

  state = {};

  render() {
    let { disabled, comment, base, checked } = this.state;
    let { pending, user, item } = this.props;

    return <ModalDialog id="comment-form" color="commented">
      {base ? <h4>Edit comment</h4> : <h4>Enter a comment</h4>}

      <input id="comment-initials" label="Initials" placeholder="initials"
        disabled={disabled} defaultValue={pending.initials || user.initials} />

      <textarea id="comment-text" value={comment} label="Comment"
        placeholder="comment" rows={5} disabled={disabled}
        onChange={event => this.setState({ comment: event.target.value })} />

      {user.role === "director" && /^([A-Z]+|[0-9]+)$/m.test(item.attach)
        ? <input id="flag" type="checkbox" checked={checked}
          label="item requires discussion or follow up" onClick={this.flag} />
        : null}

      <button className="btn-default" data-dismiss="modal"
        disabled={disabled}>Cancel</button>

      {comment
        ? <button className="btn-warning" onClick={this.delete}
          disabled={disabled}>Delete</button>
        : null}

      <button className="btn-primary" onClick={this.save}
        disabled={disabled || comment === base}>Save</button>
    </ModalDialog>
  };

  componentDidMount() {
    // update comment text to match current item
    jQuery("#comment-form").on("show.bs.modal", () => {
      let base = this.props.item.status?.pending?.comments;
      let checked = this.props.item.flagged;
      this.setState({ base, checked, comment: base, disabled: false })
    });

    // autofocus on comment text
    jQuery("#comment-form").on("shown.bs.modal", () => {
      document.getElementById("comment-text").focus()
    })
  };

  // when delete button is pushed, clear the comment
  delete = (event) => {
    this.setState({ comment: "" })
  };

  // when save button is pushed, post comment and dismiss modal when complete
  save = (event) => {
    let data = {
      agenda: this.props.agendaFile,
      attach: this.props.item.attach,
      initials: document.getElementById("comment-initials").value ||
        this.props.user.initials,
      comment: this.state.comment
    };

    this.setState({ disabled: true });

    Pending.update("comment", data, (pending) => {
      jQuery("#comment-form").modal("hide");
      document.body.classList.remove("modal-open");
      this.setState({ disabled: false });
      Store.dispatch(Actions.postPending(pending));
    })
  };

  flag = (event) => {
    this.setState({ checked: !this.state.checked });

    let data = {
      agenda: this.props.agendaFile,
      initials: this.props.user.initials,
      attach: this.props.item.attach,
      request: event.target.checked ? "flag" : "unflag"
    };

    Pending.update("approve", data, pending => {
      Store.dispatch(Actions.postPending(pending))
  })
  }
};

export default connect(mapStateToProps)(AddComment)
