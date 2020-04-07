// import ActionItems from "../pages/action-items.js"; TODO
import Agenda from "../models/agenda.js";
import HistoricalComments from "../models/comments.js";
import { Link } from "react-router-dom";
import Main from "../layout/main.js";
import Minutes from "../models/minutes.js";
import Posted from "../models/posted.js";
import React from "react";
import Reporter from "../models/reporter.js";
import Responses from "../models/responses.js";
import Text from "./text.js";
import User from "../models/user.js";
import { hotlink, Flow, splitComments } from "../utils.js";

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
    let history = HistoricalComments.find(this.props.item.title);
    let posted, link, dfr, dto, count;

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

      {this.props.item.comments.length !== 0 || (history && !this.state.prefix) ? <>
        <h4 id={`${this.state.prefix}comments`}>Comments</h4>

        {this.props.item.comments.map(comment => (
          <pre className="comment">
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

        {history && !this.state.prefix ? Object.entries(history).map((date, comments) => <>
          {Agenda.file === `board_agenda_${date}.txt` ? null : <>
            <h5 className="history">
              <span>• </span>

              <a href={HistoricalComments.link(date, this.props.item.title)}>{date.replace(
                /_/g,
                "-"
              )}</a>

              {link = null}

              {date > "2016_04" ? <>
                {dfr = date.replace(/_/g, "-")}
                {dto = new Date(Date.now()).toISOString().slice(0, 10)}
                {count = Responses.find(dfr, this.props.item.title)}

                {count ? <>
                  {date < "2017_11" ? --count : null}
                  {count === 0 ? link = "(no responses)" : count === 1 ? link = "(1 response)" : link = `(${count} responses)`}
                </> : Responses.loading ? link = "(loading)" : link = "(no responses)"}
              </> : null}

              {link ? <>
                <span>: </span>
                <a href={`https://lists.apache.org/list.html?board@apache.org&d=dfr=${dfr}|dto=${dto}&header_subject='Board%20feedback%20on%20${dfr}%20${this.props.item.title}%20report'`}>{link}</a>
              </> : null}
            </h5>;

            {splitComments(comments).map(comment => (
              <pre className="comment">
                <Text raw={comment} filters={[hotlink]} />
              </pre>
            ))}
          </>}
        </>) : null}
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

export default AdditionalInfo
