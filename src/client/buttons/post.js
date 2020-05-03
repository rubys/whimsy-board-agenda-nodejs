import ModalDialog from "../elements/modal-dialog.js";
import Posted from "../models/posted.js";
import React from "react";
import Reporter from "../models/reporter.js";
import { Server, post, Flow, retrieve } from "../utils.js";
import { connect } from 'react-redux';
import jQuery from "jquery";
import store from '../store';
import * as Actions from "../../actions.js";

function mapStateToProps(state) {
  return {
    agendaFile: state.client.agendaFile,
    userid: state.server.user.userid,
    agenda: state.agenda
  }
};

//
// Post or edit a report or resolution
//
// For new resolutions, allow entry of title, but not commit message
// For everything else, allow modification of commit message, but not title
class Post extends React.Component {
  static get button() {
    return {
      text: "post report",
      className: "btn-primary",
      disabled: Server.offline,
      data_toggle: "modal",
      data_target: "#post-report-form"
    }
  };

  state = {
    button: this.props.button.text,
    disabled: false,
    alerted: false,
    edited: false,
    pmcs: [],
    roster: [],
    parent: null,
    search: '',
    indent: 0,
    report: ''
  }

  render() {
    let pmcname = this.state.pmcname;

    if (pmcname && !/[A-Z]/.test(pmcname)) {
      pmcname = pmcname.replace(/\b\w/g, c => c.toUpperCase())
    }

    let search = this.state.search.toLowerCase().split(" ");

    let reporting_this_month;

    return <ModalDialog className="wide-form" id="post-report-form" color="commented">
      {this.state.button === "add item" ? <>
        <h4>Select Item Type</h4>

        <ul className="new-item-type">
          <li>
            <button className="btn-primary btn" onClick={this.selectItem}>Change Chair</button>
            - change chair for an existing PMC
          </li>

          <li>
            <button className="btn-primary btn" onClick={this.selectItem}>Establish Project</button>
            - direct to TLP project and subproject to TLP
          </li>

          <li>
            <button className="btn-primary btn" onClick={this.selectItem}>Terminate Project</button>
            - move a project to the attic
          </li>

          <li>
            <button className="btn-primary btn" onClick={this.selectItem}>New Resolution</button>
            - free form entry of a new resolution
          </li>

          <li>
            <button className="btn-info btn" onClick={this.selectItem}>Out of Cycle Report</button>
            - report from a PMC not currently on the agenda for this month
          </li>

          <li>
            <button className="btn-success btn" onClick={this.selectItem}>Discussion Item</button>
            - add a discussion item to the agenda
          </li>
        </ul>

        <button className="btn-default" data-dismiss="modal">Cancel</button>

      </> : this.state.button === "Change Chair" ? <>

        <h4>Change Chair Resolution</h4>

        <div className="form-group">
          <label htmlFor="change-chair-pmc">PMC</label>

          <select className="form-control" id="change-chair-pmc" onChange={event => (
            this.chair_pmc_change(event.target.value)
          )}>{this.state.pmcs.map(pmc => <option key={pmc}>{pmc}</option>)}</select>
        </div>

        <div className="form-group">
          <label htmlFor="outgoing-chair">Outgoing Chair</label>
          <input className="form-control" id="outgoing-chair" value={this.state.outgoing_chair} disabled={true} />
        </div>

        <div className="form-group">
          <label htmlFor="incoming-chair">Incoming Chair</label>

          <select className="form-control" id="incoming-chair" defaultValue={this.props.userid}>{this.state.pmc_members.map(person => (
            <option key={person.id} value={person.id}>{person.name}</option>
          ))}</select>
        </div>

        <button className="btn-default" data-dismiss="modal">Cancel</button>
        <button className="btn-primary" disabled={this.state.disabled} onClick={this.draft_chair_change_resolution}>Draft</button>

      </> : this.state.button === "Establish Project" ? <>

        <h4>Establish Project Resolution</h4>

        <div className="form-group">
          <label htmlFor="establish-pmc">PMC name</label>
          <input className="form-control" id="establish-pmc" value={this.state.pmcname} />
        </div>

        <div className="form-group">
          <label htmlFor="establish-description">Complete this sentence:</label>
          {pmcname ? ` Apache ${pmcname} consists of software related to` : null}
          <textarea className="form-control" id="establish-description" value={this.state.pmcdesc} disabled={!pmcname} />
        </div>

        <div className="form-group">
          <label htmlFor="parent-pmc">Parent PMC name (if applicable)</label>

          <select className="form-control" id="parent-pmc" onChange={event => (
            this.parent_pmc_change(event.target.value)
          )}>

            <option value="" defaultValue>-- none --</option>

            {this.state.pmcs.map((pmc) => (
              pmc === "incubator" ? null : <option key={pmc}>{pmc}</option>
            ))}
          </select>
        </div>

        {this.state.chair ? <div className="form-group">
          <label>{`Chair: ${this.state.chair.name}`}</label>
        </div> : null}

        <label>Initial set of PMC members</label>

        <p>
          {!this.state.chair ? "Search for the chair " : "Search for additional PMC members "}
        using the search box below, and select
        the desired name using the associated checkbox
      </p>

        {this.state.pmc.map(person => (
          <div0 className="form-check" key={person.id}>
            <input className="form-check-input" type="checkbox" checked={true} value={person.id} id={`person_${person.id}`} />
            <label className="form-check-label" htmlFor={`person_${person.id}`}>{person.name}</label>
          </div0>
        ))}

        <div>
          <input className="form-control" value={this.state.search} placeholder="search"
            onChange={(event) => { this.setState({ search: event.target.value }) }} />
        </div>

        {this.state.search.length >= 3 && Server.committers ? <>

          {Server.committers.map((person) => {
            if (search.every(part => (
              person.id.includes(part) || person.name.toLowerCase().includes(part)
            ))) {
              return <div className="form-check" key={person.id}>
                <input className="form-check-input" type="checkbox" id={`person_${person.id}`} onClick={() => (
                  this.establish_pmc(person)
                )} />

                <label className="form-check-label" htmlFor={`person_${person.id}`}>{person.name}</label>
              </div>
            } else {
              return null
            }
          })}
        </> : this.state.search.length === 0 && this.state.roster && this.state.roster.length !== 0 ? this.state.roster.map((person) => {

          if (!this.state.pmc.includes(person)) {
            return <div3 className="form-check" key={person.id}>
              <input className="form-check-input" type="checkbox" id={`person_${person.id}`} onClick={() => (
                this.establish_pmc(person)
              )} />

              <label className="form-check-label" htmlFor={`person_${person.id}`}>{person.name}</label>
            </div3>
          } else {
            return null
          }

        }) : null}

        <button className="btn-default" data-dismiss="modal">Cancel</button>
        <button className="btn-primary" onClick={this.draft_establish_project} disabled={!this.state.pmcname || !this.state.pmcdesc || this.state.pmc.length === 0}>Draft</button>

      </> : this.state.button === "Terminate Project" ? <>

        <h4>Terminate Project Resolution</h4>

        <div className="form-group">
          <label htmlFor="terminate-pmc">PMC</label>

          <select className="form-control" id="terminate-pmc">{this.state.pmcs.map(pmc => (
            <option key={pmc}>{pmc}</option>
          ))}</select>
        </div>

        <p>Reason for termination:</p>

        <div className="form-check">
          <input className="form-check-input" id="termvote" type="radio" name="termreason" onClick={() => (
            this.setState({ termreason: "vote" })
          )} />

          <label className="form-check-label" htmlFor="termvote">by vote of the PMC</label>
        </div>

        <div className="form-check">
          <input className="form-check-input" id="termconsensus" type="radio" name="termreason" onClick={() => (
            this.setState({ termreason: "consensus" })
          )} />

          <label className="form-check-label" htmlFor="termconsensus">by consensus of the PMC</label>
        </div>

        <div className="form-check">
          <input className="form-check-input" id="termboard" type="radio" name="termreason" onClick={() => (
            this.setState({ termreason: "board" })
          )} />

          <label className="form-check-label" htmlFor="termboard">by the board for inactivity</label>
        </div>

        <button className="btn-default" data-dismiss="modal">Cancel</button>
        <button className="btn-primary" onClick={this.draft_terminate_project} disabled={this.state.pmcs.length === 0 || !this.state.termreason}>Draft</button>

      </> : this.state.button === "Out of Cycle Report" ? <>

        <h4>Out of Cycle PMC Report</h4>
        {reporting_this_month = []}

        {this.props.agenda.map((item) => {
          if (item.roster && /^[A-Z]+$/m.test(item.attach)) {
            return reporting_this_month << item.roster.split("/").pop()
          } else {
            return null
          }
        })}

        <div className="form-group">
          <label htmlFor="out-of-cycle-pmc">PMC</label>

          <select className="form-control" id="out-of-cycle-pmc">{this.state.pmcs.map((pmc) => (
            reporting_this_month.includes(pmc) ? null : <option key={pmc}>{pmc}</option>
          ))}</select>
        </div>

        <button className="btn-default" data-dismiss="modal">Cancel</button>
        <button className="btn-primary" disabled={this.state.pmcs.length === 0} onClick={this.draft_out_of_cycle_report}>Draft</button>

      </> : true ? <>

        <h4>{this.state.header}</h4>

        {this.state.header === "Add Resolution" || this.state.header === "Add Discussion Item"
          ? <input id="post-report-title" label="title" disabled={this.state.disabled} placeholder="title" value={this.state.title} onFocus={this.default_title} />
          : null}

        <textarea id="post-report-text" label={this.state.label} value={this.state.report} placeholder={this.state.label} rows={17} disabled={this.state.disabled} onInput={this.change_text} />

        {this.props.item?.title === "Treasurer" ? <form>
          <div className="form-group">
            <label htmlFor="upload">financial spreadsheet from virtual</label>
            <input id="upload" type="file" value={this.state.upload} />
            <button className="btn-primary btn" onClick={this.upload_spreadsheet} disabled={this.state.disabled || !this.state.upload}>Upload</button>
          </div>
        </form> : null}

        {this.state.header !== "Add Resolution" && this.state.header !== "Add Discussion Item" ? <>
          <input id="post-report-message" label="commit message" disabled={this.state.disabled} value={this.state.message} />
        </> : <></>}

        <button className="btn-default" data-dismiss="modal">Cancel</button>
        <button className={this.reflow_color()} onClick={this.reflow}>Reflow</button>
        <button className="btn-primary" onClick={this.submit} disabled={!this.ready()}>Submit</button>
      </> : <></>}

    </ModalDialog>
  };

  // add item menu support
  selectItem = (event) => {
    let $button = event.target.textContent;

    if ($button === "Change Chair") {
      this.initialize_chair_change()
    } else if ($button === "Establish Project") {
      this.initialize_establish_project()
    } else if ($button === "Terminate Project") {
      this.initialize_terminate_project()
    } else if ($button === "Out of Cycle Report") {
      this.initialize_out_of_cycle()
    };

    this.retitle();
    this.setState({ 'button': $button })
  };

  // autofocus on report/resolution title/text
  componentDidMount() {
    jQuery("#post-report-form").on("show.bs.modal", () => {
      // update contents when modal is about to be shown
      this.setState({ button: this.props.button.text });
      this.retitle()
    });

    jQuery("#post-report-form").on(
      "shown.bs.modal",
      () => this.reposition()
    )
  };

  // reposition after update if header changed
  componentDidUpdate() {
    if (Post.header !== this.state.header) this.reposition()
  };

  // set focus, scroll
  reposition = () => {
    // set focus once modal is shown
    let title = document.getElementById("post-report-title");
    let text = document.getElementById("post-report-text");

    if (title || text) {
      (title || text).focus();

      // scroll to the top
      setTimeout(() => { if (text) text.scrollTop = 0 }, 0)
    };

    Post.header = this.state.header
  };

  // initialize form title, etc.
  componentDitUpdate() {
    this.retitle()
  };

  // match form title, input label, and commit message with button text
  retitle = () => {
    let $digest, $alerted, $base;
    let $edited = this.state.edited;
    let $header = this.state.header;
    let $report = this.state.report;
    $report = null;
    this.parent_pmc_change(null);

    switch (this.state.button) {
      case "post report":
        $header = "Post Report";

        this.setState({
          label: "report",
          message: `Post ${this.props.item.title} Report`
        });

        // if by chance the report was posted to board@, attempt to fetch
        // the text/plain version of the body
        let posted = Posted.get(this.props.item.title);

        if (posted.length !== 0) {
          post(
            "posted-reports",
            { path: posted[posted.length - 1].path },
            response => this.setState({ report: $report = $report || response.text })
          )
        };

        // if there is a draft being prepared at reporter.apache.org, use it
        let draft = Reporter.find(this.props.item);
        if (draft) $report = draft.text;
        break;

      case "edit item":
        $header = "Edit Discussion Item";

        this.setState({
          label: "text",
          message: `Edit ${this.props.item.title} Discussion Item`
        });

        break;

      case "edit report":
        $header = "Edit Report";

        this.setState({
          label: "report",
          message: `Edit ${this.props.item.title} Report`
        });

        break;

      case "Add Resolution":
      case "New Resolution":
        $header = "Add Resolution";
        this.setState({ label: "resolution", title: "" });
        break;

      case "edit resolution":
        $header = "Edit Resolution";
        this.setState({ label: "resolution", title: "" });
        break;

      case "post item":
      case "Discussion Item":
        $header = "Add Discussion Item";
        this.setState({ label: "text", message: "Add Discussion Item" });
        break;

      case "post items":
        $header = "Post Discussion Items";
        this.setState({ label: "text", message: "Post Discussion Items" });
        break;

      case "edit items":
        $header = "Edit Discussion Items";
        this.setState({ label: "text", message: "Edit Discussion Items" })
        break;

      default:
    };

    if (!$edited) {
      let text = $report || this.props.item?.text || "";

      if (this.props.item?.title === "President") {
        text = text.replace(
          /\s*Additionally, please see Attachments \d through \d\./,
          ""
        )
      };

      $report = text;
      $digest = this.props.item?.digest;
      $alerted = false;
      $edited = false;
      $base = $report
    } else if (!$alerted && $edited && $digest !== this.props.item?.digest) {
      alert("edit conflict");
      $alerted = true
    } else {
      $report = $base
    };

    if ($header === "Add Resolution" || /^[47]/m.test(this.props.item?.attach)) {
      this.setState({ indent: "        " })
    } else if ($header === "Add Discussion Item") {
      this.setState({ indent: "        " })
    } else if (this.props.item?.attach === "8.") {
      this.setState({ indent: "    " })
    } else {
      this.setState({ indent: "" })
    };

    this.setState({
      report: $report,
      header: $header,
      edited: $edited,
      digest: $digest,
      base: $base,
      alerted: $alerted
    })
  };

  // default title based on common resolution patterns
  default_title = (event) => {
    if (this.state.title) return;
    let match = null;

    if ((match = this.state.report.match(/to\s+be\s+known\s+as\s+the\s+"Apache\s+(.*?)\s+Project",\s+be\s+and\s+hereby\s+is\s+established/))) {
      this.setState({ title: `Establish the Apache ${match[1]} Project` })
    } else if ((match = this.state.report.match(/appointed\s+to\s+the\s+office\s+of\s+Vice\s+President,\s+Apache\s+(.*?),/))) {
      this.setState({ title: `Change the Apache ${match[1]} Project Chair` })
    } else if ((match = this.state.report.match(/the\s+Apache\s+(.*?)\s+project\s+is\s+hereby\s+terminated/))) {
      this.setState({ title: `Terminate the Apache ${match[1]} Project` })
    }
  };

  // track changes to text value
  change_text = (event) => {
    this.setState({ report: event.target.value });
    this.change_message()
  };

  // update default message to reflect whether only whitespace changes were
  // made or if there is something more that was done
  change_message = () => {
    let edited = this.state.base !== this.state.report;

    if (new RegExp(`(Edit|Reflow) ${this.props.item.title} Report`).test(this.state.message)) {
      if (edited && this.state.base.replace(/[ \t\n]+/g, "") === this.state.report.replace(/[ \t\n]+/g, "")) {
        this.setState({ message: `Reflow ${this.props.item.title} Report` })
      } else {
        this.setState({ message: `Edit ${this.props.item.title} Report` })
      }
    };

    this.setState({ edited })
  };

  // determine if reflow button should be default or danger color
  reflow_color = () => {
    let width = 80 - this.state.indent.length;

    if (this.state.report.split("\n").every(line => line.length <= width)) {
      return "btn-default"
    } else {
      return "btn-danger"
    }
  };

  // perform a reflow of report text
  reflow = () => {
    let regex, indents;
    let report = this.state.report;
    let textarea = document.getElementById("post-report-text");
    let indent, start, finish;
    indent = start = finish = 0;

    // extract selection (if any)
    if (textarea && textarea.selectionEnd > textarea.selectionStart) {
      start = textarea.selectionStart;

      while (start > 0 && report[start - 1] !== "\n") {
        start--
      };

      finish = textarea.selectionEnd;

      while (report[finish] !== "\n" && finish < report.length - 1) {
        finish++
      }
    };

    // enable special punctuation rules for the incubator
    let puncrules = this.props.item.title === "Incubator";

    // reflow selection or entire report
    if (finish > start) {
      report = Flow.text(
        report.slice(start, finish + 1),
        this.state.indent + indent,
        puncrules
      );

      if (indent > 0) report.replace(/^/gm, new Array(indent + 1).join(" "));
      this.setState({ report: this.state.report.slice(0, start) + report + this.state.report.slice(finish + 1) })
    } else {
      // remove indentation
      if (!/^\S/m.test(report)) {
        regex = /^( +)/gm;
        indents = [];
        let result;

        while ((result = regex.exec(report))) {
          indents.push(result[1].length)
        };

        if (indents.length !== 0) {
          indent = Math.min(...indents);

          report = report.replace(
            new RegExp("^" + new Array(indent + 1).join(" "), "gm"),
            ""
          )
        }
      };

      this.setState({
        report: Flow.text(
          report,
          this.state.indent,
          puncrules
        )
      })
    };

    this.change_message()
  };

  // determine if the form is ready to be submitted
  ready = () => {
    if (this.state.disabled) return false;

    if (this.state.header === "Add Resolution" || this.state.header === "Add Discussion Item") {
      return this.state.report !== "" && this.state.title !== ""
    } else {
      return this.state.report !== this.props.item.text && this.state.message !== ""
    }
  };

  // when save button is pushed, post comment and dismiss modal when complete
  submit = (event) => {
    let data;
    this.setState({ edited: false });

    if (this.state.header === "Add Resolution" || this.state.header === "Add Discussion Item") {
      data = {
        agenda: this.props.agendaFile,
        attach: this.state.header === "Add Resolution" ? "7?" : "8?",
        title: this.state.title,
        report: this.state.report
      }
    } else {
      data = {
        agenda: this.props.agendaFile,
        attach: this.state.attach || this.props.item.attach,
        digest: this.state.digest,
        message: this.state.message,
        report: this.state.report
      }
    };

    this.setState({ disabled: true });

    post("post", data, (response) => {
      jQuery("#post-report-form").modal("hide");
      document.body.classList.remove("modal-open");
      this.setState({ attach: null, disabled: false });
      store.dispatch(Actions.postAgenda(response.agenda))
    })
  };

  //########################################################################
  //                                Treasurer                              #
  //########################################################################
  // upload contents of spreadsheet in base64; append extracted table to report
  upload_spreadsheet = (event) => {
    this.setState({ disabled: true });
    event.preventDefault();
    let reader = new FileReader();

    reader.onload = (event) => {
      // Convert the spreadsheet a byte at a time because
      // Chrome Javascript did not handle the following properly:
      // String.fromCharCode(*Uint8Array.new(event.target.result))
      // See commit 46058b1e8baff80c75ea72f5b79f2f23af2e87a5
      let bytes = new Uint8Array(event.target.result);
      let binary = "";

      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      };

      post("financials", { spreadsheet: btoa(binary) }, (response) => {
        let report = this.state.report;
        if (report && !report.endsWith("\n")) report += "\n";
        if (report) report += "\n";
        report += response.table;
        this.change_text({ target: { value: report } });
        this.setState({ upload: null, disabled: false })
      })
    };

    reader.readAsArrayBuffer(document.getElementById("upload").files[0])
  };

  //########################################################################
  //                            Establish Project                          #
  //########################################################################
  initialize_establish_project = () => {
    this.setState({
      search: "",
      pmcname: undefined,
      pmcdesc: undefined,
      chair: null,
      pmc: []
    });

    // get a list of committers
    if (!Server.committers) {
      retrieve(
        "committers",
        "json",
        committers => Server.committers = committers || []
      )
    };

    // get a list of PMCs
    if (this.state.pmcs.length === 0) {
      post(
        "post-data",
        { request: "committee-list" },
        response => this.setState({ pmcs: response })
      )
    }
  };

  establish_pmc(person) {
    if (!this.state.chair) this.setState({ chair: person });
    this.state.pmc.push(person);
    this.setState({ search: "" })
  };

  draft_establish_project = () => {
    this.setState({ disabled: true });
    let people = [];

    for (let checkbox of Array.from(document.querySelectorAll("input:checked"))) {
      people.push(checkbox.value)
    };

    let options = {
      request: "establish",
      pmcname: this.state.pmcname,
      parent: this.state.parent,
      description: this.state.pmcdesc,
      chair: this.state.chair.id,
      people: people.join(",")
    };

    post("post-data", options, response => (
      this.setState({
        button: "Add Resolution",
        header: "Add Resolution",
        title: response.title,
        report: response.draft,
        label: "resolution",
        disabled: false
      })
    ))
  };

  //########################################################################
  //                            Terminate Project                          #
  //########################################################################
  initialize_terminate_project = () => {
    // get a list of PMCs
    if (this.state.pmcs.length === 0) {
      post(
        "post-data",
        { request: "committee-list" },
        response => this.setState({ pmcs: response })
      )
    };

    this.setState({ termreason: null })
  };

  draft_terminate_project = () => {
    this.setState({ disabled: true });

    let options = {
      request: "terminate",
      pmc: document.getElementById("terminate-pmc").value,
      reason: this.state.termreason
    };

    post("post-data", options, response => (
      this.setState({
        button: "Add Resolution",
        header: "Add Resolution",
        title: response.title,
        report: response.draft,
        label: "resolution",
        disabled: false
      })
    ))
  };

  //########################################################################
  //                           Out of Cycle report                         #
  //########################################################################
  initialize_out_of_cycle = () => {
    this.setState({ disabled: true });

    // gather a list of reports already on the agenda
    let scheduled = {};

    for (let item of this.props.agenda) {
      if (/^[A-Z]/m.test(item.attach)) scheduled[item.title.toLowerCase] = true
    };

    // get a list of PMCs and select ones that aren't on the agenda
    let $pmcs = [];

    post("post-data", { request: "committee-list" }, (response) => {
      for (let pmc of response) {
        if (!scheduled[pmc]) $pmcs.push(pmc)
      }
    });

    this.setState({ pmcs: $pmcs })
  };

  draft_out_of_cycle_report = () => {
    let pmc = document.getElementById("out-of-cycle-pmc").value.replace(
      /\b[a-z]/g,
      s => s.toUpperCase()
    );

    this.setState({
      button: "post report",
      report: "",
      header: "Post Report",
      label: "report",
      message: `Post Out of Cycle ${pmc} Report`,
      attach: "+" + pmc,
      disabled: false
    })
  };

  //########################################################################
  //                         Change Project Chair                          #
  //########################################################################
  initialize_chair_change = () => {
    this.setState({ disabled: true, pmcs: [] });
    this.chair_pmc_change(null);

    post("post-data", { request: "committee-list" }, (response) => {
      if (!response) return;
      this.setState({ pmcs: response });
      this.chair_pmc_change(response[0])
    });
  };

  chair_pmc_change(pmc) {
    this.setState({ disabled: true, outgoing_chair: '', pmc_members: [] });
    if (!pmc) return;

    post("post-data", { request: "committee-members", pmc }, response => (
      this.setState({
        outgoing_chair: response.chair.name,
        pmc_members: response.members,
        disabled: false
      })
    ))
  };

  parent_pmc_change(pmc) {
    this.setState({ roster: [], parent: pmc });
    if (!pmc) return;

    post("post-data", { request: "committer-list", pmc }, (response) => {
      if (response) this.setState({ roster: response.members })
    })
  };

  draft_chair_change_resolution = () => {
    this.setState({ disabled: true });

    let options = {
      request: "change-chair",
      pmc: document.getElementById("change-chair-pmc").value,
      chair: document.getElementById("incoming-chair").value
    };

    post("post-data", options, response => {
      this.setState({
        button: "Add Resolution",
        header: "Add Resolution",
        title: response.title,
        report: response.draft,
        label: "resolution",
        disabled: false
      });
    })
  }
};

export default connect(mapStateToProps)(Post)
