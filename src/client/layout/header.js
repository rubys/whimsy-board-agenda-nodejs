import Agenda from "../models/agenda.js";
import Info from "../elements/info.js";
import Link from "../elements/link.js";
import Pending from "../models/pending.js";
import PodlingNameSearch from "../elements/pns.js";
import React from "react";
import { Server } from "../utils.js";
import { connect } from 'react-redux';

//
// Header: title on the left, dropdowns on the right
//
// Also keeps the window/tab title in sync with the header title
//
// Finally: make info dropdown status 'sticky'
class Header extends React.Component {
  #infodropdown = null;

  render() {
    /* eslint-disable jsx-a11y/anchor-is-valid */
    let summary = this.props.item.summary || Agenda.summary;


    return <header className={"navbar-navbar-fixed-top " + this.props.item.color}>
      <div className="navbar-brand">{this.props.item.title}</div>
      {/^7/m.test(this.props.item.attach) && /^Establish .* Project/m.test(this.props.item.fulltitle) ? <PodlingNameSearch item={this.props.item} /> : null}
      {this.props.clock_counter > 0 ? <span role="img" aria-label="clock" id="clock">⌛</span> : null}

      <ul className="nav nav-pills navbar-right">
        {Pending.count > 0 || Server.offline ? <li className="label label-danger">
          {Server.offline ? <span>OFFLINE: </span> : null}
          <Link text={Pending.count} href="queue" />
        </li> : null}

        {this.props.item.attach ?
          <li className={"report-info dropdown " + this.#infodropdown}>
            <a id="info" className="dropdown-toggle" onClick={this.toggleInfo}>
              <>info</>
              <b className="caret" />
            </a>

            <Info item={this.props.item} position="dropdown-menu" />
          </li> : this.props.item.online ? <li className="dropdown">
            <a id="info" className="dropdown-toggle" data-toggle="dropdown">
              <>online</>
              <b className="caret" />
            </a>

            <ul className="online dropdown-menu">
              {this.props.item.online.map(id =>
                <li>
                  <a href={`/roster/committer/${id}`}>{id}</a>
                </li>
              )}
            </ul>
          </li> :
            <li className="dropdown">
              <a id="info" className="dropdown-toggle" data-toggle="dropdown">
                summary
                <b className="caret" />
              </a>

              <table className="table-bordered online dropdown-menu">
                <tbody>{summary.map((status) => {
                  let text = status.text;
                  if (status.count === 1) text = text.replace(/s$/m, "");

                  return <tr className={status.color} key={text}>
                    <td>
                      <Link text={status.count} href={status.href} />
                    </td>

                    <td>
                      <Link text={text} href={status.href} />
                    </td>
                  </tr>
                })}</tbody>
              </table>
            </li>}

        <li className="dropdown">
          <a id="nav" className="dropdown-toggle" data-toggle="dropdown">
            <>navigation</>
            <b className="caret" />
          </a>

          <ul className="dropdown-menu">
            <li>
              <Link id="agenda" text="Agenda" href="." />
            </li>

            {Agenda.index.map((item) => {
              if (item.index) {
                return <li>
                  <Link text={item.index} href={item.href} />
                </li>
              } else {
                return null
              }
            })}

            <li className="divider" />

            <li>
              <Link text="Search" href="search" />
            </li>

            <li>
              <Link text="Comments" href="comments" />
            </li>

            {Agenda.shepherd ? <li>
              <Link id="shepherd" text="Shepherd" href={`shepherd/${Agenda.shepherd}`} />
            </li> : null}

            <li>
              <Link id="queue" text="Queue" href="queue" />
            </li>

            <li className="divider" />

            <li>
              <Link id="backchannel" text="Backchannel" href="backchannel" />
            </li>

            <li>
              <Link id="help" text="Help" href="help" />
            </li>
          </ul>
        </li>
      </ul>
    </header>
  };

  // toggle info dropdown
  toggleInfo = () => {
    this.#infodropdown = this.#infodropdown ? null : "open"
  }
};

function mapStateToProps(state) {
  return { clock_counter: state.clock_counter }
};

export default connect(mapStateToProps)(Header)
