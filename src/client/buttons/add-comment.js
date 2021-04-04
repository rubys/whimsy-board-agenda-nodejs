import ModalDialog from "../elements/modal-dialog.js";
import Pending from "../models/pending.js";
import React, { useState, useCallback } from "react";
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
function AddComment(props) {
  let [disabled, setDisabled] = useState(false);
  let [comment, setComment] = useState('');
  let [base, setBase] = useState('');
  let [checked, setChecked] = useState(false);

  let { pending, user, item } = props;

  const ref = useCallback(node => {
    if (node) {
      // remove previous event handlers
      jQuery(node).off("show.bs.modal");
      jQuery(node).off("shown.bs.modal");

      // update form to match current item
      jQuery(node).on("show.bs.modal", () => {
        let base = item.status?.pending?.comments || '';
        setBase(base);
        setComment(base);
        setDisabled(false);

        if (item.status?.pending && 'flagged' in item.status.pending) {
          setChecked(item.status.pending.flagged)
        } else {
          setChecked(item.flagged || false)
        }
      });

      // autofocus on comment text
      jQuery(node).on("shown.bs.modal", () => {
        document.getElementById("comment-text").focus()
      })
    }
  }, [item]);

  // when save button is pushed, post comment and dismiss modal when complete
  function save(event) {
    let data = {
      agenda: props.agendaFile,
      attach: item.attach,
      initials: document.getElementById("comment-initials").value || user.initials,
      comment: comment
    };

    setDisabled(true);

    Pending.update("comment", data, pending => {
      jQuery("#comment-form").modal("hide");
      document.body.classList.remove("modal-open");
      setDisabled(false);
      Store.dispatch(Actions.postPending(pending));
    })
  };

  function flag(event) {
    setChecked(!checked);

    let data = {
      agenda: props.agendaFile,
      initials: user.initials,
      attach: item.attach,
      request: event.target.checked ? "flag" : "unflag"
    };

    Pending.update("approve", data, pending => {
      Store.dispatch(Actions.postPending(pending))
    })
  }

  return <ModalDialog ref={ref} id="comment-form" color="commented">
    {base ? <h4>Edit comment</h4> : <h4>Enter a comment</h4>}

    <input id="comment-initials" label="Initials" placeholder="initials"
      disabled={disabled} defaultValue={pending.initials || user.initials} />

    <textarea id="comment-text" value={comment} label="Comment"
      placeholder="comment" rows={5} disabled={disabled}
      onChange={event => setComment(event.target.value)} />

    {user.role === "director" && /^([A-Z]+|[0-9]+)$/m.test(item.attach)
      ? <input id="flag" type="checkbox" checked={checked}
        label="item requires discussion or follow up" onChange={flag} />
      : null}

    <button className="btn-default" data-dismiss="modal"
      disabled={disabled}>Cancel</button>

    {comment
      ? <button className="btn-warning" onClick={() => setComment('')}
        disabled={disabled}>Delete</button>
      : null}

    <button className="btn-primary" onClick={save}
      disabled={disabled || comment === base}>Save</button>
  </ModalDialog>
};

AddComment.button = {
  text: "add comment",
  className: "btn-primary",
  data_toggle: "modal",
  data_target: "#comment-form"
};

export default connect(mapStateToProps)(AddComment)
