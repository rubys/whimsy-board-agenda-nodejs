import Commit from "../buttons/commit.js";
import { Link } from "react-router-dom";
import Pending from "../models/pending.js";
import React from "react";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    user: state.server.user,
    pending: state.server.pending,
    agenda: state.agenda
  }
};

//
// A page showing all queued approvals and comments, as well as items
// that are ready for review.
//
class Queue extends React.Component {
  render() {
    let { user } = this.props;

    let pending = this.pending;

    return <div className="col-xs-12">
      {user?.role === "director" ? <>
        <h4>Approvals</h4>

        <p className="col-xs-12">
          {pending.approvals.map((item, index) => <>
            {index > 0 ? <span>, </span> : null}
            <Link to={`queue/${item.href}`}>{item.title}</Link>
          </>)}

          {pending.approvals.length === 0 ? <em>None.</em> : null}
        </p>

        {["Unapprovals", "Flagged", "Unflagged"].map(section => {
          let list = pending[section.toLowerCase()];

          if (list.length === 0) {
            return null;
          } else {
            return <>
              <h4>{section}</h4>

            <p className="col-xs-12">{list.map((item, index) => <>
                {index > 0 ? <span>, </span> : null}
                <Link to={item.href}>{item.title}</Link>
              </>)}</p>
            </>
          }
        })}
      </> : null}

      <h4>Comments</h4>

      {pending.comments.length === 0
        ? <p className="col-xs-12">
          <em>None.</em>
          <pre>comments: {JSON.stringify(pending)}</pre>
        </p>
        : <dl className="dl-horizontal">
          {pending.comments.map(item => <>

            <dt>
              <Link to={item.href}>{item.title}</Link>
            </dt>

            <dd>{item.status.pending.comments.split("\n\n").map(paragraph => <p>{paragraph}</p>)}</dd>
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

      {user?.role === "director" && pending.ready.length !== 0 ? <>
        <hr />

        <h4>Ready for review</h4>

        <p className="col-xs-12">{pending.ready.map((item, index) => <React.Fragment key={item.href}>
          {index > 0 ? <span>, </span> : null}
          <Link to={`queue/${item.href}`} className={item.status.color + (index === 0 ? " default" : '')}>{item.title}</Link>
        </React.Fragment>)}</p>
      </> : null}
    </div>
  };

  // determine approvals, rejected, comments, and ready
  get pending() {
    let result = {
      approvals: [],
      unapprovals: [],
      flagged: [],
      unflagged: [],
      comments: [],
      ready: []
    };

    let agenda=Object.values(this.props.agenda).sort((item1, item2) => item1.sortOrder - item2.sortOrder);

    for (let item of agenda) {
      let pending = item.status.pending;
      let action = false;

      if (pending?.comments) result.comments.push(item);

      if (pending?.approved) {
        result.approvals.push(item);
        action = true
      };

      if (pending?.unapproved) {
        result.unapprovals.push(item);
      };

      if (pending?.flagged) {
        result.flagged.push(item);
        action = true
      };

      if (pending?.unflagged) {
        result.unflagged.push(item);
      };

      if (!action && item.status?.ready_for_review) {
        result.ready.push(item)
      }
    };

    return result
  }
};

export default connect(mapStateToProps)(Queue)
