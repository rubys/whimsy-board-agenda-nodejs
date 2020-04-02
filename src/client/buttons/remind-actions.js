import Agenda from "../models/agenda.js";
import ModalDialog from "../elements/modal-dialog.js";
import React from "react";
import { CandidateAction } from "../pages/select-actions.js";
import { post } from "../utils.js";
import { jQuery } from "jquery";

//
// Send reminders for action items
//
class ActionReminder extends React.Component {
  static button() {
    return {
      text: "send reminders",
      class: "btn_primary",
      data_toggle: "modal",
      data_target: "#reminder-form"
    }
  };

  state = {
    disabled: false,

    list: this.props.item.actions.map(action => (
      Object.assign({ complete: action.status !== "" }, action)
    ))
  };

  // commit form: allow the user to select which reminders to send
  render() {
    return <ModalDialog id="reminder-form" className="wide-form" color="blank">
      <h4>Send reminders</h4>

      <pre className="report">{this.state.list.map(action => (
        <CandidateAction action={action} />
      ))}</pre>

      <button className="btn-default" data_dismiss="modal">Close</button>
      <button className="btn-info" onClick={this.click} disabled={this.state.disabled}>Dry Run</button>
      <button className="btn-primary" onClick={this.click} disabled={this.state.disabled}>Submit</button>
    </ModalDialog>
  };

  click(event) {
    let dryrun = event.target.textContent === "Dry Run";

    let data = {
      dryrun,
      agenda: Agenda.file,
      actions: this.state.list.filter(item => !item.complete)
    };

    this.setState({ disabled: true });

    post("remind-actions", data, (response) => {
      if (!response) {
        alert("Server error - check console log")
      } else if (dryrun) {
        console.log(Object.values(response.sent).join("\n---\n\n"));
        delete response.sent;
        console.log(response);
        alert("Dry run - check console log")
      } else if (response.count === this.state.list.length) {
        alert(`Reminders have been sent to: ${response.sent.keys.join(", ")}.`)
      } else if (response.count && response.unsent) {
        alert(`Error: no emails were sent to ${response.unsent.join(", ")}`)
      } else {
        alert("No reminders were sent")
      };

      this.setState({ disabled: false });
      Agenda.load(response.agenda, response.digest);
      jQuery("#reminder-form").modal("hide");
      document.body.classList.remove("modal-open")
    })
  }
};

export default ActionReminder