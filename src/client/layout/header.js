import Minutes from "../models/minutes.js";
import Colorize from "../elements/colorize.js";
import Info from "../elements/info.js";
import { Link } from "react-router-dom";
import Pending from "../models/pending.js";
import PodlingNameSearch from "../elements/pns.js";
import React from "react";
import { Server } from "../utils.js";
import { connect } from 'react-redux';

// Header: title on the left, dropdowns on the right
//
// Also keeps the window/tab title in sync with the header title
//
// Finally: make info dropdown status 'sticky'

function mapStateToProps(state) {
  return {
    agenda: state.agenda,
    clock_counter: state.clock_counter,
    user: state.server.user
  }
};

class Header extends React.Component {
  state = { infodropdown: null };

  render() {
    /* eslint-disable jsx-a11y/anchor-is-valid */
    let props = this.props.item || this.props;
    let summary = props.summary || this.summary();

    // update title to match the item title whenever page changes
    if (typeof document !== 'undefined' && props.title) {
      let title = document.getElementsByTagName("title")[0]
      if (title.textContent !== props.title) {
        title.textContent = props.title
      }
    }

    return <Colorize item={props}>
      <header className="navbar fixed-top">
        <div className="navbar-brand">{props.title}</div>

        {/^7/m.test(props.attach) && /^Establish .* Project/m.test(props.fulltitle)
          ? <PodlingNameSearch item={props} />
          : null}

        {this.props.clock_counter > 0 ? <span role="img" aria-label="clock" id="clock">⌛</span> : null}

        <ul className="nav nav-pills navbar-right">
          {Pending.count > 0 || Server.offline ? <li className="label label-danger">
            {Server.offline ? <span>OFFLINE: </span> : null}
            <Link to="queue">{Pending.count}</Link>
          </li> : null}

          {props.attach ?
            <li className={"report-info dropdown"} data-toggle="dropdown">
              <button id="info" className="btn dropdown-toggle" data-toggle="dropdown">
                info
              </button>

              <Info item={props} position="dropdown-menu" />
            </li>

            : props.online ?

              <li className="dropdown">
                <button id="info" className="btn dropdown-toggle" data-toggle="dropdown">
                  online
                </button>

                <ul className="online dropdown-menu">
                  {props.online.map(id =>
                    <li>
                      <a href={`/roster/committer/${id}`}>{id}</a>
                    </li>
                  )}
                </ul>
              </li>

              :

              <li className="dropdown">
                <button id="info" className="btn dropdown-toggle" data-toggle="dropdown">
                  summary
                </button>

                <table className="table-bordered online dropdown-menu">
                  <tbody>{summary.map((status) => {
                    let text = status.text;
                    if (status.count === 1) text = text.replace(/s$/m, "");

                    return <tr className={status.color} key={text}>
                      <td>
                        <Link to={status.href}>{status.count}</Link>
                      </td>

                      <td>
                        <Link to={status.href}>{text}</Link>
                      </td>
                    </tr>
                  })}</tbody>
                </table>
              </li>
          }

          <li className="dropdown">
            <button id="nav" className="btn dropdown-toggle" data-toggle="dropdown">
              navigation
            </button>

            <ul className="dropdown-menu">
              <li>
                <Link id="agenda" to="/">Agenda</Link>
              </li>

              {this.props.agenda.map(item => {
                if (item.index) {
                  return <li>
                    <Link to={item.href}>{item.index}</Link>
                  </li>
                } else {
                  return null
                }
              })}

              <li className="divider" />

              <li>
                <Link to="/search">Search</Link>
              </li>

              <li>
                <Link to="/comments">Comments</Link>
              </li>

              {this.props.user.role === 'director' ? <li>
                <Link id="shepherd" to={`/shepherd/${this.props.user.firstname}`}>Shepherd</Link>
              </li> : null}

              <li>
                <Link id="queue" to="queue">Queue</Link>
              </li>

              <li className="divider" />

              <li>
                <Link id="backchannel" to="/backchannel">Backchannel</Link>
              </li>

              <li>
                <Link id="help" to="/help">Help</Link>
              </li>
            </ul>
          </li>
        </ul>
      </header>
    </Colorize>
  };

  // summarize the state of the various reports
  summary = () => {
    let results = [];
    let agenda = this.props.agenda;

    // committee reports
    let count = 0;
    let link = null;

    for (let item of agenda) {
      if (/^[A-Z]+$/m.test(item.attach)) {
        count++;
        link = link || item.href
      }
    };

    results.push({
      color: "available",
      count,
      href: link,
      text: "committee reports"
    });

    // special orders
    count = 0;
    link = null;

    for (let item of agenda) {
      if (/^7[A-Z]+$/m.test(item.attach)) {
        count++;
        link = link || item.href
      }
    };

    results.push({
      color: "available",
      count,
      href: link,
      text: "special orders"
    });

    // discussion items
    count = 0;
    link = null;

    for (let item of agenda) {
      if (/^8[.A-Z]+$/m.test(item.attach)) {
        if (item.attach !== "8." || !!item.text) count++;
        link = link || item.href
      }
    };

    results.push({
      color: "available",
      count,
      href: link,
      text: "discussion items"
    });

    // awaiting preapprovals
    count = 0;

    for (let item of agenda) {
      if (item.color === "ready" && item.title !== "Action Items") count++
    };

    results.push({
      color: "ready",
      count,
      href: "queue",
      text: "awaiting preapprovals"
    });

    // flagged reports
    count = 0;

    for (let item of agenda) {
      if (item.flagged_by) count++
    };

    results.push({
      color: "commented",
      count,
      href: "flagged",
      text: "flagged reports"
    });

    // missing reports
    count = 0;

    for (let item of agenda) {
      if (item.missing) count++
    };

    results.push({
      color: "missing",
      count,
      href: "missing",
      text: "missing reports"
    });

    // rejected reports
    count = 0;

    for (let item of agenda) {
      if (item.rejected) count++
    };

    if (Minutes.started || count > 0) {
      results.push({
        color: "missing",
        count,
        href: "rejected",
        text: "not accepted"
      })
    };

    return results
  };
};

export default connect(mapStateToProps)(Header)
