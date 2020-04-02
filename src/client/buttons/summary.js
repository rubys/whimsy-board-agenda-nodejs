import Agenda from "../models/agenda.js";
import Minutes from "../models/minutes.js";
import ModalDialog from "../elements/modal-dialog.js";
import React from "react";
import { retrieve, post } from "../utils.js";
import { jQuery } from "jquery";

class Summary extends React.Component {
  static button() {
    return {
      text: "send summary",
      class: "btn_danger",
      data_toggle: "modal",
      data_target: "#summary-form"
    }
  };

  state = {disabled: true};

  render() {
    return <ModalDialog id="summary-form" className="wide-form" color="commented">
      <h4 className="commented">Send out meeting summary to committers</h4>
      <textarea id="summary-text" className="form-control" rows={17} tabIndex={1} placeholder="committers summary" value={this.state.summary} disabled={this.state.disabled}/>
      <button className="btn-default" type="button" data_dismiss="modal">Cancel</button>
      <button className="btn-primary" type="button" onClick={this.send} disabled={this.state.disabled}>Send</button>
    </ModalDialog>
  };

  // autofocus on summary text; fetch summary
  mounted() {
    this.setState({summary: ""});

    jQuery("#summary-form").on("show.bs.modal", () => (
      retrieve(`summary/${Agenda.title}`, "text", (summary) => {
        document.getElementById("summary-text").focus();
        this.setState({disabled: false, summary: summary});
        jQuery("#summary-text").animate({scrollTop: 0})
      })
    ))
  };

  send(event) {
    this.setState({disabled: true});

    post(
      "summary",
      {agenda: Agenda.file, text: this.state.summary},

      (response) => {
        Minutes.load(response.minutes);
        this.setState({disabled: false});
        jQuery("#summary-form").modal("hide");
        document.body.classList.remove("modal-open")
      }
    )
  }
};

export default Summary