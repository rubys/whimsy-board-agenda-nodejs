import Agenda from "../models/agenda.js";
import Commit from "../buttons/commit.js";
import { Link } from "react-router-dom";
import Offline from "../buttons/offline.js";
import Pending from "../models/pending.js";
import React from "react";
import Refresh from "../buttons/refresh.js";
import User from "../models/user.js";

//
// A page showing all queued approvals and comments, as well as items
// that are ready for review.
//
class Queue extends React.Component {
  static buttons() {
    let buttons = [{ button: Refresh }];
    if (Pending.count > 0) buttons.push({ form: Commit });
    if (Pending.offline_enabled) buttons.push({ button: Offline });
    return buttons
  };

  render() {
    return <div className="col-xs-12">
      {User.role === "director" ? <>
        <h4>Approvals</h4>

        <p className="col-xs-12">
          {this.pending.approvals.forEach((item, index) => <>
            {index > 0 ? <span>, </span> : null}
            <Link to={`queue/${item.href}`}>{item.title}</Link>
          </>)}

          {this.pending.approvals.length === 0 ? <em>None.</em> : null}
        </p>

        {["Unapprovals", "Flagged", "Unflagged"].map(section => {
          let list = this.pending[section.toLowerCase()];

          if (list.length === 0) {
            return null;
          } else {
            return <>
              <h4>{section}</h4>;

            <p className="col-xs-12">{list.forEach((item, index) => <>
                {index > 0 ? <span>, </span> : null}
                <Link to={item.href}>{item.title}</Link>
              </>)}</p>
            </>
          }
        })}
      </> : null}

      <h4>Comments</h4>

      {this.pending.comments.length === 0 ? <p className="col-xs-12">
        <em>None.</em>
      </p> : <dl className="dl-horizontal">
          {this.pending.comments.map(item => <>

            <dt>
              <Link to={item.href}>{item.title}</Link>
            </dt>

            <dd>{item.pending.split("\n\n").map(paragraph => <p>{paragraph}</p>)}</dd>
          </>)}
        </dl>}

      {Pending.status.length !== 0 ? <>
        <h4>Action Items</h4>

        <ul>
          {Pending.status.map(item => {

            let text = item.text;

            if (item.pmc || item.date) {
              text += " [";
              if (item.pmc) text += ` ${item.pmc}`;
              if (item.date) text += ` ${item.date}`;
              text += " ]";
            };

            return <li>{text}</li>
          })}
        </ul>
      </> : null}

      {User.role === "director" && this.pending.ready.length !== 0 ? <>
        <div className="col-xs-12 row">
          <hr />
        </div>

        <h4>Ready for review</h4>

        <p className="col-xs-12">{this.pending.ready.forEach((item, index) => <>
          {index > 0 ? <span>, </span> : null}
          <Link to={`queue/${item.href}`} className={index === 0 ? "default" : null}>{item.title}</Link>
        </>)}</p>
      </> : null}
    </div>
  };

  // determine approvals, rejected, comments, and ready
  pending() {
    let result = {
      approvals: [],
      unapprovals: [],
      flagged: [],
      unflagged: [],
      comments: [],
      ready: []
    };

    for (let item of Agenda.index) {
      if (Pending.comments[item.attach]) result.comments.push(item);
      let action = false;

      if (Pending.approved.includes(item.attach)) {
        result.approvals.push(item);
        action = true
      };

      if (Pending.unapproved.includes(item.attach)) {
        result.unapprovals.push(item);
        action = true
      };

      if (Pending.flagged.includes(item.attach)) {
        result.flagged.push(item);
        action = true
      };

      if (Pending.unflagged.includes(item.attach)) {
        result.unflagged.push(item);
        action = true
      };

      if (!action && item.ready_for_review(User.initials)) result.ready.push(item)
    };

    return result
  }
};

export default Queue