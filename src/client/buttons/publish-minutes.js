import Agenda from "../models/agenda.js";
import ModalDialog from "../elements/modal-dialog.js";
import React from "react";
import { jQuery } from "jquery";
import { post, retrieve, Server } from "../utils.js";

class PublishMinutes extends React.Component {
  static button() {
    return {
      text: "publish minutes",
      class: "btn_danger",
      data_toggle: "modal",
      data_target: "#publish-minutes-form"
    }
  };

  state = {disabled: false, previous_title: null};
  
  render() {
    return <ModalDialog id="publish-minutes-form" className="wide-form" color="commented">
      <h4 className="commented">Publish Minutes onto the ASF web site</h4>
      <textarea id="summary-text" className="form-control" rows={10} tabIndex={1} value={this.state.summary} disabled={this.state.disabled} label="Minutes summary"/>
      <input id="message" label="Commit message" value={this.state.message} disabled={this.state.disabled}/>
      <button className="btn-default" type="button" data_dismiss="modal">Cancel</button>
      <button className="btn-primary" type="button" onClick={this.publish} disabled={this.state.disabled}>Submit</button>
    </ModalDialog>
  };

  // On first load, ensure summary is produced
  created() {
    if (this.props.item.title !== this.state.previous_title) {
      if (!this.props.item.attach) {
        // Index page for a path month's agenda
        this.summarize(Agenda.index, Agenda.title.replace(/-/g, "_"))
      } else if (typeof XMLHttpRequest !== 'undefined') {
        // Minutes from previous meetings section of the agenda
        let date = (this.props.item.text.match(/board_minutes_(\d+_\d+_\d+)\.txt/) || [])[1];

        let url = document.baseURI.replace(
          /[-\d]+\/$/m,
          date.replace(/_/g, "-")
        ) + ".json";

        retrieve(url, "json", agenda => this.summarize(agenda, date))
      };

      this.setState({previous_title: this.props.item.title})
    }
  };

  // autofocus on minute text
  mounted() {
    jQuery("#publish-minutes-form").on(
      "shown.bs.modal",
      () => document.getElementById("summary-text").focus()
    )
  };

  // compute default summary for web site and commit message
  summarize(agenda, date) {
    let summary = `- [${this.formatDate(date)}](../records/minutes/${date.slice(
      0,
      4
    )}/board_minutes_${date}.txt)\n`;

    for (let item of agenda) {
      if (/^7\w$/m.test(item.attach)) {
        if (item.minutes && item.minutes.toLowerCase().includes("tabled")) {
          summary += `    * ${item.title.trim()} (tabled)\n`
        } else {
          summary += `    * ${item.title.trim()}\n`
        }
      }
    };

    this.setState({
      date: date,
      summary: summary,
      message: `Publish ${this.formatDate(date)} minutes`
    })
  };

  // convert date to displayable form
  formatDate(date) {
    let months = [
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

    date = new Date(date.replace(/_/g, "/"));
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getYear() + 1900}`
  };

  publish(event) {
    let data = {
      date: this.state.date,
      summary: this.state.summary,
      message: this.state.message
    };

    this.setState({disabled: true});

    post("publish", data, (drafts) => {
      this.setState({disabled: false});
      Server.drafts = drafts;
      jQuery("#publish-minutes-form").modal("hide");
      document.body.classList.remove("modal-open");
      window.open("https://cms.apache.org/www/publish", "_blank").focus()
    })
  }
};

export default PublishMinutes