import Agenda from "../models/agenda.js";
import Minutes from "../models/minutes.js";
import ModalDialog from "../elements/modal-dialog.js";
import React from "react";
import jQuery from "jquery";
import { Flow, post } from "../utils.js";

class AddMinutes extends React.Component {
  static get button() {
    return {
      text: "add minutes",
      className: "btn-primary",
      data_toggle: "modal",
      data_target: "#minute-form"
    }
  };

  state = { disabled: false };

  render() {
    return <ModalDialog id="minute-form" className="wide-form" color="commented">
      <h4 className="commented">Minutes</h4>

      {this.props.item.comments.length === 0 ? <textarea id="minute-text" className="form-control" rows={17} tabIndex={1} placeholder="minutes" value={this.state.draft} /> : <>
        <textarea id="minute-text" className="form-control" rows={12} tabIndex={1} placeholder="minutes" value={this.state.draft} />
        <h3>Comments</h3>

        <div id="minute-comments">
          {this.props.item.comments.map(comment => <pre className="comment">{comment}</pre>)}
        </div>
      </>}

      <div className="row" style={{ marginTop: "1em" }}>
        <button className="col-md-1 col-md-offset-1 btn-info btn-sm btn" onClick={this.addAI} disabled={!this.state.ai_owner || !this.state.ai_text}>+ AI</button>

        <label className="col-md-2">
          <select value={this.state.ai_owner}>
            {Minutes.attendee_names.map(name => <option>{name}</option>)}
          </select>
        </label>

        <textarea className="col-md-7" value={this.state.ai_text} rows={1} cols={40} tabIndex={2} />
      </div>

      {/^[A-Z]+$/m.test(this.props.item.attach) ? <input id="flag" type="checkbox" label="report was not accepted" onClick={this.reject} checked={this.state.checked} /> : null}

      <button className="btn-default" type="button" data-dismiss="modal" onClick={() => (
        this.setState({ draft: this.state.base })
      )}>Cancel</button>

      {this.state.base ? <button className="btn-warning" type="button" onClick={() => (
        this.setState({ draft: "" })
      )}>Delete</button> : null}

      {/^3\w/m.test(this.props.item.attach) ? <>
        <button className="btn-warning" type="button" onClick={this.save} disabled={this.state.disabled}>Tabled</button>
        <button className="btn-success" type="button" onClick={this.save} disabled={this.state.disabled}>Approved</button>
      </> : null}

      <button className={this.reflow_color()} onClick={this.reflow}>Reflow</button>
      <button className="btn-primary" type="button" onClick={this.save} disabled={this.state.disabled || this.state.base === this.state.draft}>Save</button>
    </ModalDialog>
  };

  mounted() {
    // update form to match current item
    jQuery("#minute-form").on(
      "show.bs.modal",
      () => this.setup(this.props.item)
    );

    // autofocus on minute text
    jQuery("#minute-form").on(
      "shown.bs.modal",
      () => document.getElementById("minute-text").focus()
    )
  };

  // when initially displayed, set various fields to match the item
  created() {
    this.setup(this.props.item)
  };

  // reset base, draft minutes, shepherd, default ai_text, and indent
  setup(item) {
    let draft = Minutes.get(item.title);
    this.setState({ base: draft || "" });

    if (/^(8|9|1\d)\.$/m.test(item.attach)) {
      draft = draft || item.text
    } else if (!item.text) {
      this.setState({ ai_text: `pursue a report for ${item.title}` })
    };

    this.setState({
      draft: draft,
      ai_owner: item.shepherd,
      indent: /^\w+$/m.test(this.props.item.attach) ? 8 : 4,
      checked: this.props.item.rejected
    })
  };

  // add an additional AI to the draft minutes for this item
  addAI = (event) => {
    let $draft = this.state.draft;
    if ($draft) $draft += "\n";
    $draft += `@${this.state.ai_owner}: ${this.state.ai_text}`;

    this.setState({
      ai_owner: this.props.item.shepherd,
      ai_text: "",
      draft: $draft
    })
  };

  // determine if reflow button should be default or danger color
  reflow_color() {
    let width = 78 - this.state.indent;

    if (!this.state.draft || this.state.draft.split("\n").every(line => (
      line.length <= width
    ))) {
      return "btn-default"
    } else {
      return "btn-danger"
    }
  };

  reflow() {
    this.setState({
      draft: Flow.text(
        this.state.draft || "",
        new Array(this.state.indent + 1).join(" ")
      )
    })
  };

  save = event => {
    let text;

    switch (event.target.textContent) {
      case "Save":
        text = this.state.draft;
        break;

      case "Tabled":
        text = "tabled";
        break;

      case "Approved":
        text = "approved";
        break;

      default:
        text = "unknown";
    };

    let data = {
      agenda: Agenda.file,
      title: this.props.item.title,
      text,
      reject: this.state.checked
    };

    this.setState({ disabled: true });

    post("minute", data, (minutes) => {
      Minutes.load(minutes);
      this.setup(this.props.item);
      this.setState({ disabled: false });
      jQuery("#minute-form").modal("hide");
      document.body.classList.remove("modal-open")
    })
  };

  reject = (event) => {
    let $checked = this.state.checked;
    $checked = !$checked;

    let data = {
      agenda: Agenda.file,
      title: this.props.item.title,
      text: this.state.base,
      reject: $checked
    };

    post("minute", data, minutes => Minutes.load(minutes));
    this.setState({ checked: $checked })
  }
};

export default AddMinutes