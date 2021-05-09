import Info from "../elements/info.js";
import { Link } from "react-router-dom";
import PodlingNameSearch from "../elements/pns.js";
import React, { useState } from "react";
import { connect } from 'react-redux';

// Header: title on the left, dropdowns on the right
//
// Also keeps the window/tab title in sync with the header title
//
// Finally: make info dropdown status 'sticky'

function mapStateToProps(state) {
  return {
    agenda: state.agenda || {},
    clockCounter: state.clockCounter,
    pendingCount: state.server.pending?.count || 0,
    user: state.server.user,
    offline: state.client.offline,
    forked: state.server.forked
  }
};

function Header(props) {
  let { agenda, clockCounter, user, offline, forked, pendingCount } = props;
  let [infoToggle, setInfoToggle] = useState('');

  // summarize the state of the various reports
  function makeSummary() {
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

      if (item.status.flagged_by) {
        add(item, tally.flaggedReports)
      }

      if (item.status.missing) {
        add(item, tally.missingReports)
      } else if ('approved_by' in item.status && item.status.approved === false) {
        add(item, tally.awaitingPreapprovals)
      }
    };

    return Object.values(tally)
  };

  function toggleInfo() {
    setInfoToggle(infoToggle === '' ? 'show' : '')
  };

  let color = props.color || props.item?.status.color || 'blank';

  props = props.item || props;
  let summary = props.summary || makeSummary();

  // update title to match the item title whenever page changes
  if (typeof document !== 'undefined' && props.title) {
    let title = document.getElementsByTagName("title")[0]
    if (title && title.textContent !== props.title) {
      title.textContent = props.title
    }
  }

  // find shortest shepherd (for example, "Rich")
  let shepherd = null;
  let firstname = user?.firstname?.toLowerCase() || '';

  for (let item of Object.values(agenda)) {
    if (item.shepherd && firstname.startsWith(item.shepherd.toLowerCase()) && (!shepherd || item.shepherd.length < shepherd.lenth)) {
      shepherd = item.shepherd
    }
  };

  return <header className={`navbar fixed-top ${color}`}>
    <div className="navbar-brand">{props.title}</div>

    {/^7/m.test(props.attach) && /^Establish .* Project/m.test(props.fulltitle)
      ? <PodlingNameSearch item={props} />
      : null}

    {clockCounter > 0 ? <span role="img" aria-label="clock" id="clock">⌛</span> : null}

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
        <li className={"report-info dropdown"}>
          <button id="info" className="btn dropdown-toggle" onClick={toggleInfo}>
            info
            </button>

          <Info item={props} position={`dropdown-menu ${infoToggle}`} />
        </li>

        : props.online ?

          <li className="dropdown">
            <button id="info" className="btn dropdown-toggle" onClick={toggleInfo}>
              online
              </button>

            <ul className={`online dropdown-menu ${infoToggle}`}>
              {props.online.map(id =>
                <li>
                  <a href={`/roster/committer/${id}`}>{id}</a>
                </li>
              )}
            </ul>
          </li>

          :

          <li className="dropdown">
            <button id="info" className="btn dropdown-toggle" onClick={toggleInfo}>
              summary
            </button>

            <table className={`table-bordered online dropdown-menu ${infoToggle}`}>
              <tbody>{summary.map(status => {
                let text = status.text;
                if (status.count === 1) text = text.replace(/s$/m, "");

                let href = status.href || status.item?.href

                return <tr className={status.color} key={text}>
                  {href ? <>
                    <td>
                      <Link to={href}>{status.count}</Link>
                    </td>

                    <td>
                      <Link to={href}>{text}</Link>
                    </td>
                  </> : <>
                    <td>{status.count}</td>
                    <td>{text}</td>
                  </>}
                </tr>
              })}</tbody>
            </table>
          </li>
      }

      <li className="dropdown">
        <button id="nav" className="btn dropdown-large dropdown-toggle" data-toggle="dropdown">
          navigation
          </button>

        <ul className="dropdown-menu">
          <li>
            <Link id="agenda" to="/">Agenda</Link>
          </li>

          {Object.values(agenda)
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

          {shepherd ? <li>
            <Link id="shepherd" to={`/shepherd/${shepherd}`}>Shepherd</Link>
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
};

export default connect(mapStateToProps)(Header)
