// import ActionItems from "../pages/action-items.js"; TODO
import Agenda from "../models/agenda.js";
import JSONStorage from "../models/jsonstorage.js";
import { Link } from "react-router-dom";
import Main from "../layout/main.js";
import Minutes from "../models/minutes.js";
import Posted from "../models/posted.js";
import React from "react";
import Reporter from "../models/reporter.js";
import Responses from "../models/responses.js";
import Store from '../store.js';
import Text from "./text.js";
import User from "../models/user.js";
import { hotlink, Flow, splitComments } from "../utils.js";
import * as Actions from "../../actions.js";
import { connect } from 'react-redux';
import { Server } from '../utils.js'

//
// Display information associated with an agenda item:
//   - special notes
//   - minutes
//   - posted reports
//   - action items
//   - posted comments
//   - pending comments
//   - historical comments
//
// Note: if AdditionalInfo is included multiple times in a page, set
//       prefix to true (or a string) to ensure rendered id attributes
//       are unique.
//
class AdditionalInfo extends React.Component {
  state = { prefix: '' };

  render() {
    let minutes = Minutes.get(this.props.item.title);
    let draft = Reporter.find(this.props.item);
    let posted;

    return <>
      {this.props.item.rejected ? <p className="rejected">Report was not accepted</p> : null}
      {this.props.item.notes ? <p className={!/^new, monthly through/m.test(this.props.item.notes) ? "notes" : null}>{this.props.item.notes}</p> : null}

      {minutes ? <>
        <h4 id={`${this.state.prefix}minutes`}>Minutes</h4>
        <pre className="comment">{minutes}</pre>
      </> : null}

      {this.props.item.missing ? <>
        {posted = Posted.get(this.props.item.title)}

        {posted.length !== 0 ? <>
          <h4 id={`${this.state.prefix}posted`}>Posted reports</h4>

          <ul className="posted-reports">
            {posted.map(post =>
              <li key={post.link}>
                <a href={post.link}>{post.subject}</a>
              </li>
            )}
          </ul>
        </> : null}
      </> : null}

      {draft && this.state.prefix ? <span className="hilite">
        <em>Unposted draft being prepared at </em>
        <a href={`https://reporter.apache.org/wizard?${draft.project}`}>reporter.apache.org</a>
      </span> : null}

      {this.props.item.title !== "Action Items" && this.props.item.actions.length !== 0 ? <>
        <h4 id={`${this.state.prefix}actions`}>
          <Link to="Action-Items">Action Items</Link>
        </h4>

        {/* <ActionItems item={this.props.item} filter={{ pmc: this.props.item.title }} /> TODO */}
      </> : null}

      {this.props.item.special_orders.length !== 0 ? <>
        <h4 id={`${this.state.prefix}orders`}>Special Orders</h4>

        <ul>{this.props.item.special_orders.map(resolution => (
          <li key={resolution.href}>
            <Link to={resolution.href}>{resolution.title}</Link>
          </li>
        ))}</ul>
      </> : null}

      {this.props.item.comments.length !== 0 || (this.props.historicalComments.length > 0 && !this.state.prefix) ? <>
        <h4 id={`${this.state.prefix}comments`}>Comments</h4>

        {this.props.item.comments.map(comment => (
          <pre className="comment" key={comment}>
            <Text raw={comment} filters={[hotlink]} />
          </pre>
        ))}

        {this.props.item.pending ? <div className="clickable commented comment" onClick={() => (
          Main.navigate("queue")
        )}>

          <h5 id={`${this.state.prefix}pending`}>Pending Comment</h5>

          <pre className="commented">{Flow.comment(
            this.props.item.pending,
            User.initials
          )}</pre>
        </div> : null}

        {this.props.historicalComments.map(([date, comments]) => <React.fragment key={date}>
          {Agenda.file === `board_agenda_${date}.txt` ? null : <>
            <h5 className="history">
              <span>• </span>

              <a href={this.historicalLink(date)}>{date.replace(/_/g, "-")}</a>

              {(() => {
                // link to mail archive for feedback thread
                if (date > "2016_04") { // when feedback emails were first started
                  let dfr = date.replace(/_/g, "-");
                  let dto = new Date(Date.now()).toISOString().slice(0, 10);
                  let count = Responses.find(dfr, this.props.item.title);
                  let link;

                  if (count) {
                    // when board was copied on the initial email
                    if (date < "2017_11") --count;

                    if (count === 0) {
                      link = "(no responses)"
                    } else if (count === 1) {
                      link = "(1 response)"
                    } else {
                      link = `(${count} responses)`
                    }
                  } else if (Responses.loading) {
                    link = "(loading)"
                  };

                  return <>
                    <span>: </span>
                    <a href={`https://lists.apache.org/list.html?board@apache.org&d=dfr=${dfr}|dto=${dto}&header_subject='Board%20feedback%20on%20${dfr}%20${this.props.item.title}%20report'`}>{link}</a>
                  </>
                } else {
                  return null
                };
              })()}
            </h5>;

            {splitComments(comments).map(comment => (
              <pre className="comment" key={comment}>
                <Text raw={comment} filters={[hotlink]} />
              </pre>
            ))}
          </>}
        </React.fragment>)}
      </> : this.props.item.pending ? <div className="clickable commented comment" onClick={() => (
        Main.navigate("queue")
      )}>

        <h5 id={`${this.state.prefix}pending`}>Pending Comment</h5>

        <pre className="commented">{Flow.comment(
          this.props.item.pending,
          User.initials
        )}</pre>
      </div> : null}
    </>

  };

  // find link for historical comments based on date and report title
  historicalLink = (date) => {
    let title = this.props.item.title;

    if (Server.agendas.includes(`board_agenda_${date}.txt`)) {
      return `../${date.replace(/_/g, "-")}/${title}`
    } else {
      return `../../minutes/${title}.html#minutes_${date}`
    }
  }

  // determine prefix (if any)
  static getDerivedStateFromProps(props) {
    if (props.prefix === true) {
      return { prefix: props.item.title.toLowerCase() + "-" }
    } else if (props.prefix) {
      return { prefix: props.prefix }
    } else {
      return { prefix: "" }
    }
  }

};

function mapStateToProps(state, props) {
  let historicalComments = [];

   if ("historicalComments" in state) {
     historicalComments = Object.entries(state.historicalComments[props.item.title] || {})
   } else {
    Store.dispatch(Actions.historicalComments({}))
    JSONStorage.fetch("historical-comments", (comments) => {
      Store.dispatch(Actions.historicalComments(comments || {}))
    })
   };

  return { historicalComments }
};

export default connect(mapStateToProps)(AdditionalInfo)