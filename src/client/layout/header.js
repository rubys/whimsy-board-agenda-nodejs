import Minutes from "../models/minutes.js";
import Colorize from "../elements/colorize.js";
import Info from "../elements/info.js";
import { Link } from "react-router-dom";
import PodlingNameSearch from "../elements/pns.js";
import React from "react";
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
    pendingCount: state.server.pending.count,
    user: state.server.user,
    offline: state.client.offline,
    forked: state.server.forked
  }
};

class Header extends React.Component {
  state = { infodropdown: null };

  render() {
    let { user, offline, forked, pendingCount } = this.props;

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
          {forked ? <li>
            <span className="badge badge-warning">FORKED</span>
          </li> : null}

          {pendingCount > 0 || offline ? <li>
            <h4><span className="badge badge-danger">
              {offline ? <span>OFFLINE: </span> : null}
              <Link to="/queue">{pendingCount}</Link>
            </span></h4>
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
                  <tbody>{summary.map(status => {
                    let text = status.text;
                    if (status.count === 1) text = text.replace(/s$/m, "");

                    let href = status.href || status.item?.href

                    return <tr className={status.color} key={text}>
                      <td>
                        <Link to={href}>{status.count}</Link>
                      </td>

                      <td>
                        <Link to={href}>{text}</Link>
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

              {Object.values(this.props.agenda)
                .filter(item => item.index)
                .sort((item1, item2) => item1.sortOrder - item2.sortOrder)
                .map(item => (
                  <li key={item.index}>
                    <Link to={item.href}>{item.index}</Link>
                  </li>
                ))
              }

              <li className="divider" />

              <li>
                <Link to="/search">Search</Link>
              </li>

              <li>
                <Link to="/comments">Comments</Link>
              </li>

              {user.role === 'director' ? <li>
                <Link id="shepherd" to={`/shepherd/${user.firstname}`}>Shepherd</Link>
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
    let agenda = this.props.agenda;

    let tally = {
      committeeReports: {
        color: "available",
        count: 0,
        text: "committee reports"
      },

      specialOrders: {
        color: "available",
        count: 0,
        text: "special orders"
      },

      discussionItems: {
        color: "available",
        count: 0,
        href: "/Discussion-Items",
        text: "discussion items"
      },

      awaitingPreapprovals: {
        color: "ready",
        count: 0,
        href: "/queue",
        text: "awaiting preapprovals"
      },

      flaggedReports: {
        color: "commented",
        count: 0,
        href: "/flagged",
        text: "flagged reports"
      },

      missingReports: {
        color: "missing",
        count: 0,
        href: "/missing",
        text: "missing reports"
      },

      notAccepted: {
        color: "missing",
        count: 0,
        href: "/rejected",
        text: "not accepted"
      }
    };

    function add(item, section) {
      section.count++;
      if (!section.item || section.item.sortOrder > item.sortOrder) section.item = item
    }

    for (let item of Object.values(agenda)) {
      if (/^[A-Z]+$/m.test(item.attach)) {
        add(item, tally.committeeReports);

      } else if (/^7[A-Z]+$/m.test(item.attach)) {
        add(item, tally.specialOrders)

      } else if (/^8[A-Z]+$/m.test(item.attach)) {
        add(item, tally.discussionItems)
      }

      if ('approved' in item && item.approved.length < 5) {
        add(item, tally.awaitingPreapprovals)
      }

      if (item.flagged_by) {
        add(item, tally.flaggedReports)
      }

      if (item.missing) {
        add(item, tally.missingReports)
      }
    };

    return Object.values(tally)
  };
};

export default connect(mapStateToProps)(Header)
