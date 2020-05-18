import Agenda from "../models/agenda.js";
import ModalDialog from "../elements/modal-dialog.js";
import React from "react";
import { retrieve, post } from "../utils.js";
import jQuery from "jquery";

//
// Send initial and final reminders.  Note that this is a form (with an
// associated button) as well as a second button.
//
export class InitialReminder extends React.Component {
  static get button() {
    return {
      text: "send initial reminders",
      className: "btn-primary",
      disabled: true,
      data_toggle: "modal",
      data_target: "#reminder-form"
    }
  };

  state = { disabled: true, subject: "", message: "" };

  // fetch email template
  loadText = (event) => {
    let reminder;

    if (event.target.textContent.includes("non-responsive")) {
      reminder = "non-responsive"
    } else if (event.target.textContent.includes("initial")) {
      reminder = "reminder1"
    } else {
      reminder = "reminder2"
    };

    retrieve(reminder, "json", (response) => {
      this.setState({
        subject: response.subject,
        message: response.body,
        disabled: false
      });

      if (reminder === "non-responsive") {
        this.setState({ selection: "inactive" })
      } else {
        this.setState({ selection: "active" })
      }
    })
  };

  // wire up event handlers
  componentDidMount() {
    for (let button of document.querySelectorAll("button")) {
      if (button.getAttribute("data-target") === "#reminder-form") {
        button.disabled = false;
        button.addEventListener("click", this.loadText)
      }
    }
  };

  // commit form: allow the user to confirm or edit the commit message
  render() {
    return <ModalDialog id="reminder-form" className="wide-form" color="blank">
      <h4>Email message</h4>
      <input id="email-subject" value={this.state.subject} disabled={this.state.disabled} label="subject" placeholder="loading..." />
      <textarea id="email-text" value={this.state.message} rows={12} disabled={this.state.disabled} label="body" placeholder="loading..." />
      <button className="btn-default" data-dismiss="modal">Close</button>
      <button className="btn-info" onClick={this.click} disabled={this.state.disabled}>Dry Run</button>
      <button className="btn-primary" onClick={this.click} disabled={this.state.disabled}>Submit</button>
    </ModalDialog>
  };

  // on click, disable the input fields and buttons and submit
  click = (event) => {
    event.target.disabled = true;
    this.setState({ disabled: true });
    let dryrun = event.target.textContent === "Dry Run";

    // data to be sent to the server
    let data = {
      dryrun,
      agenda: Agenda.file,
      subject: this.state.subject,
      message: this.state.message,
      selection: this.state.selection,
      pmcs: []
    };

    // collect up a list of PMCs that are checked
    for (let input of Array.from(document.querySelectorAll("input[type=checkbox]"))) {
      if (input.checked && input.classList.contains(this.state.selection)) {
        data.pmcs.push(input.value)
      }
    };

    post("send-reminders", data, (response) => {
      if (!response) {
        alert("Server error - check console log")
      } else if (dryrun) {
        console.log(response);
        alert("Dry run - check console log")
      } else if (response.count === data.pmcs.length) {
        alert(`Reminders have been sent to: ${data.pmcs.join(", ")}.`)
      } else if (response.count && response.unsent) {
        alert(`Error: no emails were sent to ${response.unsent.join(", ")}`)
      } else {
        alert("No reminders were sent")
      };

      event.target.disabled = true;
      this.setState({ disabled: false });
      jQuery("#reminder-form").modal("hide");
      document.body.classList.remove("modal-open")
    })
  }
};

//
// A button for final reminders
//
export class FinalReminder extends React.Component {
  render() {
    return <button className="btn-primary btn" disabled={true} data-toggle="modal" data-target="#reminder-form">send final reminders</button>
  }
};

//
// A button for warning non-responsive PMCs
//
export class ProdReminder extends React.Component {
  render() {
    return <button className="btn-danger btn" disabled={true} data-toggle="modal" data-target="#reminder-form">prod non-responsive PMCs</button>
  }
};
