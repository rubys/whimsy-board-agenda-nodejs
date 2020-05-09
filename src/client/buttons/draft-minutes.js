import Agenda from "../models/agenda.js";
import ModalDialog from "../elements/modal-dialog.js";
import React from "react";
import jQuery from "jquery";
import { post, retrieve } from "../utils.js";

class DraftMinutes extends React.Component {
  static get button() {
    return {
      text: "draft minutes",
      className: "btn-danger",
      data_toggle: "modal",
      data_target: "#draft-minute-form"
    }
  };

  state = {disabled: true};

  render() {
    return <ModalDialog id="draft-minute-form" className="wide-form" color="commented">
      <h4 className="commented">Commit Draft Minutes to SVN</h4>
      <textarea id="draft-minute-text" className="form-control" rows={17} tabIndex={1} placeholder="minutes" value={this.state.draft} disabled={this.state.disabled}/>
      <button className="btn-default" type="button" data-dismiss="modal">Cancel</button>
      <button className="btn-primary" type="button" onClick={this.save} disabled={this.state.disabled}>Save</button>
    </ModalDialog>
  };

  // autofocus on minute text; fetch draft
  mounted() {
    this.setState({draft: ""});

    jQuery("#draft-minute-form").on("shown.bs.modal", () => (
      retrieve(
        `draft/${Agenda.title.replace(/-/g, "_")}`,
        "text",

        (draft) => {
          document.getElementById("draft-minute-text").focus();
          this.setState({disabled: false, draft: draft});
          jQuery("#draft-minute-text").animate({scrollTop: 0})
        }
      )
    ))
  };

  save = event => {
    let data = {
      agenda: Agenda.file,
      message: `Draft minutes for ${Agenda.title}`,
      text: this.state.draft
    };

    this.setState({disabled: true});

    post("draft", data, () => {
      this.setState({disabled: false});
      jQuery("#draft-minute-form").modal("hide");
      document.body.classList.remove("modal-open")
    })
  }
};

export default DraftMinutes