import ActionReminder from "../buttons/remind-actions.js";
import Agenda from "../models/agenda.js";
import { Link } from "react-router-dom";
import Minutes from "../models/minutes.js";
import ModalDialog from "../elements/modal-dialog.js";
import Pending from "../models/pending.js";
import React from "react";
import Text from "../elements/text.js";
import { Server, post, hotlink } from "../utils.js";
import { jQuery } from "jquery";

//
// Action items.  Link to PMC reports when possible, highlight missing
// action item status updates.
//
class ActionItems extends React.Component {
  static buttons() {
    return [{ form: ActionReminder }]
  };

  state = { disabled: false };

  render() {
    let first = true;
    let captured;

    return <>
      <section className="flexbox">
        {React.createElement(...(() => {
          let $_ = ["pre", { className: "report" }];

          for (let action of this.props.item.actions) {
            let match;

            // skip actions that don't match the filter
            if (this.props.filter) {
              match = true;

              for (let [key, filter] of Object.entries(this.props.filter)) {
                match = match && (action[key] === filter)
              };

              if (!match) continue
            };

            // space between items and add help info on top
            if (first) {
              if (!this.props.filter && !Minutes.complete) {
                $_.push(React.createElement(
                  "p",
                  { className: "alert-info" },
                  "Click on Status to update"
                ))
              };

              first = false
            } else {
              $_.push("\n")
            };

            // action owner and text
            $_.push(`* ${action.owner}: ${action.text}\n      `);

            if (action.pmc && !(this.props.filter && this.props.filter.title)) {
              $_.push("[ ");

              // if there is an associated PMC and that PMC is on this month's
              // agenda, link to the current report, if reporting this month
              let item = Agenda.find(action.pmc);

              if (item) {
                $_.push(React.createElement(
                  Link,
                  { className: item.color, text: action.pmc, href: item.href }
                ))
              } else if (action.pmc) {
                $_.push(React.createElement("span", { className: "blank" }, action.pmc))
              };

              // link to the original report
              if (action.date) {
                $_.push(" ");
                let agenda = `board_agenda_${action.date.replace(/-/g, "_")}.txt`;

                if (Server.agendas.includes(agenda)) {
                  $_.push(React.createElement(
                    "a",
                    { href: `../${action.date}/${action.pmc.replace(/\W/g, "-")}` },
                    action.date
                  ))
                } else {
                  $_.push(React.createElement(
                    "a",

                    {
                      href: "/board/minutes/" + action.pmc.replace(/\W/g, "_")
                        + `#minutes_${action.date.replace(/-/g, "_")}`
                    },

                    action.date
                  ))
                }
              };

              $_.push(" ]\n      ")
            } else if (action.date) {
              $_.push(`[ ${action.date} ]\n      `)
            };

            // launch edit dialog when there is a click on the status
            let options = { on: { click: this.updateStatus }, class: ["clickable"] };
            if (Minutes.complete) options = {};
            options.attrs = {};

            // copy action properties to data attributes
            for (let [name, option] of Object.entries(action)) {
              options.attrs[`data-${name}`] = option
            };

            // include pending updates
            let pending = Pending.find_status(action);
            if (pending) options.attrs["data-status"] = pending.status;

            $_.push(React.createElement("span", options), () => {
              // highlight missing action item status updates
              if (pending) {
                $_.push(React.createElement("span", null, "Status: "));

                for (let line of pending.status.split("\n")) {
                  match = line.match(/^( *)(.*)/m);
                  $_.push(React.createElement("span", null, match[1]));

                  $_.push(React.createElement(
                    "em",
                    { className: "commented" },
                    `${match[2]}\n`
                  ))
                }
              } else if (action.status === "") {
                $_.push(React.createElement(
                  "span",
                  { className: "missing" },
                  "Status:"
                ));

                $_.push("\n")
              } else {
                $_.push(React.createElement(
                  Text,
                  { raw: `Status: ${action.status}\n`, filters: [hotlink] }
                ))
              }
            })
          };

          if (first) {
            $_.push(React.createElement(
              "p",
              null,
              React.createElement("em", null, "Empty")
            ))
          };

          return $_
        })())};

        {!first ? <ModalDialog id="updateStatusForm" color="commented">
          <h4>Update Action Item</h4>

          <p>
            <span>{`${this.state.owner}: ${this.state.text}`}</span>

            {this.state.pmc ? <>
              [
              {this.state.pmc ? <span>{` ${this.state.pmc}`}</span> : null}
              {this.state.date ? <span>{` ${this.state.date}`}</span> : null}
               ]
            </> : null}
          </p>

          <textarea ref="statusText" label="Status:" value={this.state.status} rows={5} />
          <button className="btn-default" data_dismiss="modal" disabled={this.state.disabled}>Cancel</button>
          <button className="btn-primary" onClick={this.save} disabled={this.state.disabled || (this.state.baseline === this.state.status)}>Save</button>
        </ModalDialog> : null}
      </section>

      {/* Action Items Captured During the Meeting */}
      {this.props.item.title === "Action Items" ? <>
        {captured = []}

        {(() => {
          for (let action of Minutes.actions) {
            if (this.props.filter) {
              let match = true;

              for (let [key, filter] of Object.entries(this.props.filter)) {
                match = match && (action[key] === filter)
              };

              if (!match) continue;
            };

            captured.push(action)
          }
        })()}

        {captured.length !== 0 ? <section>
          <h3>Action Items Captured During the Meeting</h3>

          <pre className="comment">
            {captured.map(action => {
              let match = true;
              if (this.props.filter) {
                for (let [key, filter] of Object.entries(this.props.filter)) {
                  match = match && (action[key] === filter)
                }

                if (match) {
                  return <>
                    {`* ${action.owner}: ${action.text.replace(/\n/g, "\n        ")}\n`}
                    {action.item ? <Link to={action.item.href} className={action.item.color}>{action.item.title}</Link> : null}
                    {` ${Agenda.title} ]\n\n`}
                  </>
                }
              };
              return null
            })}
          </pre>
        </section> : null}
      </> : null}
    </>
  };

  // autofocus on action status in update action form
  mounted() {
    jQuery("#updateStatusForm").on(
      "shown.bs.modal",
      () => this.refs.refs.statusText.focus()
    )
  };

  // launch update status form when status text is clicked
  updateStatus(event) {
    let parent = event.target.parentNode;

    // update state from data attributes
    for (let i = 0; i < parent.attributes.length; i++) {
      let attr = parent.attributes[i];

      if (attr.name.startsWith("data-")) {
        this.refs.data[attr.name.slice(5)] = attr.value
      }
    };

    // unindent action
    this.setState({ status: this.state.status.replace(/\n {14}/g, "\n") });

    // set baseline to current value
    this.setState({ baseline: this.state.status });

    // show dialog
    jQuery("#updateStatusForm").modal("show")
  };

  // when save button is pushed, post update and dismiss modal when complete
  save(event) {
    let data = {
      agenda: Agenda.file,
      owner: this.state.owner,
      text: this.state.text,
      pmc: this.state.pmc,
      date: this.state.date,
      status: this.state.status
    };

    this.setState({ disabled: true });

    post("status", data, (pending) => {
      jQuery("#updateStatusForm").modal("hide");
      this.setState({ disabled: false });
      Pending.load(pending)
    })
  }
};

export default ActionItems