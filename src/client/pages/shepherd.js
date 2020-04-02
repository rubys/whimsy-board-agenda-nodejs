import ActionItems from "../pages/action-items.js";
import AdditionalInfo from "../elements/additional-info.js";
import Agenda from "../models/agenda.js";
import Email from "../buttons/email.js";
import Link from "../elements/link.js";
import Pending from "../models/pending.js";
import React from "react";
import User from "../models/user.js";
import { Server, splitComments, retrieve, post } from "../utils.js";

// A page showing all queued approvals and comments, as well as items
// that are ready for review.
//
class Shepherd extends React.Component {
  state = { disabled: false, followup: [] };

  render() {
    let shepherd = this.props.item.shepherd.toLowerCase();
    let actions = Agenda.find("Action-Items");

    let followup = [];

    Object.entries(this.state.followup).forEach(([item, title]) => {
      if (item.count !== 1) return;
      if (item.shepherd !== this.props.item.shepherd) return;
      if (Agenda.index.some(item => item.title === title)) return;
      item.title = title;
      followup.push(item)
    });

    return <>
      {actions.actions.some(action => action.owner === this.props.item.shepherd) ? <>
        <h2>Action Items</h2>
        <ActionItems item={actions} filter={{ owner: this.props.item.shepherd }} />
      </> : null}

      <h2>Committee Reports</h2>

      {Agenda.index.map((item) => {
        let mine = shepherd === User.firstname ? "btn-primary" : "btn-link";

        if (item.shepherd && item.shepherd.toLowerCase().startsWith(shepherd)) return <>
          <Link text={item.title} href={`shepherd/queue/${item.href}`} className={`h3 ${item.color}`} />;
          <AdditionalInfo item={item} prefix={true} />;

          {item.missing || item.comments.length !== 0 ?
            /^[A-Z]+$/m.test(item.attach) ?
              <div className="shepherd">
                <button className={"btn " + mine} data_attach={item.attach} onClick={this.click} disabled={this.state.disabled}>{item.flagged ? "unflag" : "flag"}</button>
                <Email item={item} />
              </div>
              : null
            : null}
        </>;

        return null
      })}

      {followup.length !== 0 ? <>
        <h2>Feedback that may require followup</h2>

        {followup.map((followup) => {
          let link = followup.title.replace(/[^a-zA-Z0-9]+/g, "-");

          return <>
            <a className="ready h3" href={`../${this.state.prior_date}/${link}`}>{followup.title}</a>;

            {splitComments(followup.comments).map(comment => (
              <pre className="comment">{comment}</pre>
            ))}
          </>;
        })}
      </> : null}
    </>
  };

  // Fetch followup items
  mounted() {
    // if cached, reuse
    if (Shepherd.followup) {
      this.setState({ followup: Shepherd.followup });
      return
    };

    // determine date of previous meeting
    let prior_agenda = Server.agendas[Server.agendas.length - 2];
    if (!prior_agenda) return;

    let $prior_date = (prior_agenda.match(/\d+_\d+_\d+/) || [])[0].replace(
      /_/g,
      "-"
    );

    retrieve(`../${$prior_date}/followup.json`, "json", (followup) => {
      Shepherd.followup = followup;
      this.setState({ followup: followup })
    });

    this.setState({ prior_date: $prior_date })
  };

  click = event => {
    let data = {
      agenda: Agenda.file,
      initials: User.initials,
      attach: event.target.getAttribute("data-attach"),
      request: event.target.textContent
    };

    this.setState({ disabled: true });

    post("approve", data, (pending) => {
      this.setState({ disabled: false });
      Pending.load(pending)
    })
  }
};

export default Shepherd