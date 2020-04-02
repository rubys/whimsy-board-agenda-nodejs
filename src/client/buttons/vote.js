import Agenda from "../models/agenda.js";
import Minutes from "../models/minutes.js";
import ModalDialog from "../elements/modal-dialog";
import React from "react";
import { jQuery } from "jquery";
import { post } from "../utils.js";

class Vote extends React.Component {
  static button() {
    return {
      text: "vote",
      class: "btn_primary",
      data_toggle: "modal",
      data_target: "#vote-form"
    }
  };

  state = {disabled: false};

  render() {
    return <ModalDialog id="vote-form" className="wide-form" color="commented">
      <h4 className="commented">Vote</h4>

      <p>
        <span>{`${this.state.votetype} vote on the matter of `}</span>
        <em>{this.props.item.fulltitle.replace(/^Resolution to/m, "")}</em>
      </p>

      <pre>{this.state.directors}</pre>
      <textarea id="vote-text" rows={4} placeholder="minutes" value={this.state.draft}/>

      <button className="btn-default" type="button" data_dismiss="modal" onClick={() => (
        this.setState({draft: this.state.base})
      )}>Cancel</button>

      {this.state.base ? <button className="btn-warning" type="button" onClick={this.save}>Delete</button> : null}
      <button className="btn-primary" type="button" onClick={this.save} disabled={this.state.draft === this.state.base}>Save</button>
      <button className="btn-warning" type="button" onClick={this.save} disabled={this.state.draft !== ""}>Tabled</button>
      <button className="btn-success" type="button" onClick={this.save} disabled={this.state.draft !== ""}>Unanimous</button>
    </ModalDialog>
  };

  // when initially displayed, set various fields to match the item
  created() {
    this.setup(this.props.item)
  };

  mounted() {
    // update form to match current item
    jQuery("#vote-form").on(
      "show.bs.modal",
      () => this.setup(this.props.item)
    );

    // autofocus on comment text
    jQuery("#vote-form").on(
      "shown.bs.modal",
      () => document.getElementById("vote-text").focus()
    )
  };

  // reset base, draft minutes, directors present, and vote type
  setup(item) {
    let $directors = Minutes.directors_present;

    // alternate forward/reverse roll calls based on month and attachment
    let month = new Date(Date.parse(Agenda.date)).getMonth();
    let attach = item.attach.charCodeAt(1);

    if ((month + attach) % 2 === 0) {
      this.setState({votetype: "Roll call"})
    } else {
      this.setState({votetype: "Reverse roll call"});
      $directors = $directors.split("\n").reverse().join("\n")
    };

    this.setState({
      base: Minutes.get(item.title) || "",
      draft: Minutes.get(item.title) || "",
      directors: $directors
    })
  };

  // post vote results
  save(event) {
    let text;

    switch (event.target.textContent) {
    case "Save":
      text = this.state.draft;
      break;

    case "Delete":
      text = "";
      break;

    case "Tabled":
      text = "tabled";
      break;

    case "Unanimous":
      text = "unanimous";
      break;

    default:
    };

    let data = {agenda: Agenda.file, title: this.props.item.title, text};
    this.setState({disabled: true});

    post("minute", data, (minutes) => {
      Minutes.load(minutes);
      this.setup(this.props.item);
      this.setState({disabled: false});
      jQuery("#vote-form").modal("hide");
      document.body.classList.remove("modal-open")
    })
  }
};

export default Vote