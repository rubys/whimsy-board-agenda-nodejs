import Agenda from "../models/agenda.js";
import ModalDialog from "../elements/modal-dialog.js";
import Posted from "../models/posted.js";
import React from "react";
import jQuery from "jquery";
import { post } from "../utils.js";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    user: state.server.user
  }
};

//
// Send email
//
class Email extends React.Component {
  state = {email: {}};

  render() {
    return <>
      <button className={"btn " + this.mailto_class()} onClick={this.launch_email_client}>send email</button>
      <EmailForm email={this.state.email} id={this.props.item.mail_list}/>
    </>
  };

  // render 'send email' as a primary button if the viewer is the shepherd for
  // the report, otherwise render the text as a simple link.
  mailto_class() {
    if (this.props.user.firstname && this.props.item.shepherd && this.props.user.firstname.startsWith(this.props.item.shepherd.toLowerCase())) {
      if (this.props.item.missing && Posted.get(this.props.item.title).length !== 0) {
        return "btn-link"
      } else {
        return "btn-primary"
      }
    } else if (this.props.item.owner === this.props.user.username && !this.props.item.missing && this.props.item.comments.length === 0) {
      return "btn-primary"
    } else {
      return "btn-link"
    }
  };

  // launch email client, pre-filling the destination, subject, and body
  launch_email_client = (event) => {
    let subject, body;
    let mail_list = this.props.item.mail_list;
    if (!mail_list.includes("@")) mail_list = `private@${mail_list}.apache.org`;
    let to = this.props.item.chair_email;
    let cc = `${mail_list},${this.props.item.cc}`;

    if (this.props.item.status.missing) {
      subject = `Missing ${this.props.item.title} Board Report`;

      if (/^\d/m.test(this.props.item.attach)) {
        body = `
          Dear ${this.props.item.owner},

          The board report for ${this.props.item.title} has not yet been submitted for
          this month's board meeting.  Please try to submit these reports by the
          Friday before the meeting. 

          Thanks,

          ${this.props.user.username}
        `
      } else {
        body = `
          Dear ${this.props.item.owner},

          The board report for ${this.props.item.title} has not yet been submitted for
          this month's board meeting. If you or another member of the PMC are
          unable to get it in by twenty-four hours before meeting time, please
          let the board know, and plan to report next month.

            https://www.apache.org/foundation/board/reporting#how

          Thanks,

          ${this.props.user.username}

          (on behalf of the ASF Board)
        `
      };

      // strip indentation; concatenate lines within a paragraph
      let indent = (body.match(/^\s*/m) || [])[0];

      body = body.trim().replace(new RegExp(indent, "g"), "\n").replace(
        /(\S)\n(\S)/g,
        "$1 $2"
      )
    } else {
      subject = `${this.props.item.title} Board Report`;
      body = this.props.item.comments.join("\n\n");

      if (!body && this.props.item.text) {
        let monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ];

        let year = parseInt(Agenda.date.split("-")[0]);
        let month = parseInt(Agenda.date.split("-")[1]);
        subject = `[REPORT] ${this.props.item.title} - ${monthNames[month - 1]} ${year}`;
        to = this.props.item.cc;
        cc = mail_list;
        body = this.props.item.text
      }
    };

    if (event.ctrlKey || event.shiftKey || event.metaKey) {
      this.setState({email: {to, cc, subject, body}});
      jQuery("#email-" + this.props.item.mail_list).modal("show")
    } else {
      window.location = `mailto:${to}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
  }
};

class EmailForm extends React.Component {
  state = {disabled: false};

  render() {
    return <ModalDialog color="commented" id={"email-" + this.props.id}>
      <h4>{`Send email - ${this.props.email.subject}`}</h4>

      <div className="row form-group">
        <label className="col-sm-2" htmlFor="email-to">To</label>
        <input className="col-sm-10" id="email-to" placeholder="destination email address" disabled={this.state.disabled} value={this.props.email.to}/>
      </div>

      <div className="row form-group">
        <label className="col-sm-2" htmlFor="email-cc">CC</label>
        <input className="col-sm-10" id="email-cc" placeholder="cc list" disabled={this.state.disabled} value={this.props.email.cc}/>
      </div>

      <div className="row form-group">
        <label className="col-sm-2" htmlFor="email-subject">Subject</label>
        <input className="col-sm-10" id="email-subject" placeholder="email subject" disabled={this.state.disabled} value={this.props.email.subject}/>
      </div>

      <textarea id="email-body" label="Body" placeholder="email text" disabled={this.state.disabled} value={this.props.email.body} rows={10}/>
      <button className="btn-default" type="button" data-dismiss="modal">Cancel</button>
      <button className="btn-primary" type="button" onClick={this.send} disabled={this.state.disabled}>Send</button>
    </ModalDialog>
  };

  send = (event) => {
    this.setState({disabled: true});

    post("email", this.props.email, (response) => {
      console.log(response);
      this.setState({disabled: false});
      jQuery("#email-" + this.props.id).modal("hide");
      document.body.classList.remove("modal-open")
    })
  }
};

export default connect(mapStateToProps)(Email)