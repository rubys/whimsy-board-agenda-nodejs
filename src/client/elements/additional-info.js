// import ActionItems from "../pages/action-items.js"; TODO
import { Link } from "react-router-dom";
import { navigate } from "../router.js";
import Posted from "../models/posted.js";
import React from "react";
import { lookup } from '../store.js';
import Text from "./text.js";
import { hotlink, Flow, splitComments } from "../utils.js";
import { connect } from 'react-redux';
import { Server } from '../utils.js';

// return the state associated with this item's title only
function mapStateToProps(state, props) {
  let title = props.item.title;

  let responses = lookup('responses');

  return {
    agendaFile: state.client.agendaFile,
    historicalComments: lookup('historicalComments')[title] || {},
    responses: responses[title] || {},
    loading: !responses,
    draft: lookup('reporter')[title] || null,
    initials: state.server.user?.initials
  }
};

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

  render() {
    const { item, historicalComments, responses, draft, loading } = this.props;

    let posted = item.missing && Posted.get(item.title);

    return <>
      {item.status.rejected ? <p className="rejected">Report was not accepted</p> : null}
      {item.notes ? <p className={!/^new, monthly through/m.test(item.notes) ? "notes" : null}>{item.notes}</p> : null}

      {item.status.minutes ? <>
        <h4 id={`${this.state.prefix}minutes`}>Minutes</h4>
        <pre className="comment">{item.status.minutes}</pre>
      </> : null}

      {item.missing && posted.length !== 0 ? <>
        <h4 id={`${this.state.prefix}posted`}>Posted reports</h4>

        <ul className="posted-reports">
          {posted.map(post =>
            <li key={post.link}>
              <a href={post.link}>{post.subject}</a>
            </li>
          )}
        </ul>
      </> : null}

      {draft && this.state.prefix ? <span className="hilite">
        <em>Unposted draft being prepared at </em>
        <a href={`https://reporter.apache.org/wizard?${draft.project}`}>reporter.apache.org</a>
      </span> : null}

      {/* TODO
      {item.title !== "Action Items" && item.actions.length !== 0 ? <>
        <h4 id={`${this.state.prefix}actions`}>
          <Link to="Action-Items">Action Items</Link>
        </h4>

        {/* <ActionItems item={item} filter={{ pmc: item.title }} />
      </> : null}
      */}

      {item.special_orders?.length ? <>
        <h4 id={`${this.state.prefix}orders`}>Special Orders</h4>

        <ul>{item.special_orders.map(resolution => (
          <li key={resolution.href}>
            <Link to={resolution.href}>{resolution.title}</Link>
          </li>
        ))}</ul>
      </> : null}

      {item.comments?.length || (Object.keys(historicalComments).length > 0 && !this.state.prefix) ? <>
        <h4 id={`${this.state.prefix}comments`}>Comments</h4>

        {item.comments?.map(comment => (
          <pre className="comment" key={comment}>
            <Text raw={comment} filters={[hotlink]} />
          </pre>
        ))}

        {item.status.pending?.comments ? <div className="clickable commented comment" onClick={() => (
          navigate("/queue")
        )}>

          <h5 id={`${this.state.prefix}pending`}>Pending Comment</h5>

          <pre className="commented">{Flow.comment(
            item.status.pending.comments,
            this.props.initials
          )}</pre>
        </div> : null}

        {Object.entries(historicalComments).map(([date, comments]) => <React.Fragment key={date}>
          {this.props.agendaFile === `board_agenda_${date}.txt` ? null : <>
            <h5 className="history">
              <span>• </span>

              <a href={this.historicalLink(date)}>{date.replace(/_/g, "-")}</a>

              {(() => {
                // link to mail archive for feedback thread
                if (date > "2016_04") { // when feedback emails were first started
                  let dfr = date.replace(/_/g, "-");
                  let dto = new Date(Date.now()).toISOString().slice(0, 10);
                  let count = responses[dfr];
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
                  } else if (loading) {
                    link = "(loading)"
                  } else {
                    link = "(no responses)"
                  };

                  return <>
                    <span>: </span>
                    <a href={`https://lists.apache.org/list.html?board@apache.org&d=dfr=${dfr}|dto=${dto}&header_subject='Board%20feedback%20on%20${dfr}%20${item.title}%20report'`}>{link}</a>
                  </>
                } else {
                  return null
                }
              })()}
            </h5>

            {splitComments(comments).map(comment => (
              <pre className="comment" key={comment}>
                <Text raw={comment} filters={[hotlink]} />
              </pre>
            ))}
          </>}
        </React.Fragment>)}
      </> : item.pending ? <div className="clickable commented comment" onClick={() => (
        navigate("/queue")
      )}>

        <h5 id={`${this.state.prefix}pending`}>Pending Comment</h5>

        <pre className="commented">{Flow.comment(
          item.pending,
          this.props.initials
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

};

export default connect(mapStateToProps)(AdditionalInfo)
