import AdditionalInfo from "../elements/additional-info.js";
import { Link } from "react-router-dom";
import React from "react";
import { Server } from "../utils.js";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    agenda: state.agenda
  }
};

//
// A page showing all flagged reports
//
class Missing extends React.Component {

  // update check marks based on current Index
  constructor(props) {
    super(props);
    this.state = { checked: {} };
    for (let item of Object.values(this.props.agenda)) {
      if (typeof this.state.checked[item.title] === 'undefined') {
        this.state.checked[item.title] = true;
      }
    }
  };

  render() {
    let first = true;
    let flagged_by;
    let agenda = Object.values(this.props.agenda)
      .sort((item1, item2) => item1.sortOrder - item2.sortOrder);

    return <>
      {agenda.map(item => (
        item.status.missing && item.owner && item.status.nonresponsive ? <>
          {first ? <h2>Non responsive PMCs</h2> : null}

          <h3 className={item.status.color}>
            {/^[A-Z]+/m.test(item.attach) ? <input className="inactive" type="checkbox" name="selected" value={item.title} checked={this.state.checked[item.title]} /> : null}
            <Link to={`flagged/${item.href}`} className={first ? "default" : null}>{item.title}</Link>
            {first = false}
            <span className="owner">{` [${item.owner} / ${item.shepherd}]`}</span>

            {item.flagged_by ? <>
              {flagged_by = Server.directors[item.flagged_by] || item.flagged_by}
              <span className="owner">{` flagged by: ${flagged_by}`}</span>
            </> : null}
          </h3>

          <AdditionalInfo item={item} prefix={true} />
        </> : null
      ))}

      {!first ? <h2>Other missing reports</h2> : null}

      {agenda.map(item => (
        item.status.missing && item.owner && !item.status.nonresponsive ? <>
          <h3 className={item.status.color}>
            {/^[A-Z]+/m.test(item.attach) ? <input className="active" type="checkbox" name="selected" value={item.title} checked={this.state.checked[item.title]} /> : null}
            <Link to={`flagged/${item.href}`} className={first ? "default" : null}>{item.title}</Link>
            {first = false}
            <span className="owner">{` [${item.owner} / ${item.shepherd}]`}</span>

            {item.flagged_by ? <>
              {flagged_by = Server.directors[item.flagged_by] || item.flagged_by}
              <span className="owner">{` flagged by: ${flagged_by}`}</span>
            </> : null}
          </h3>;

          <AdditionalInfo item={item} prefix={true} />
        </> : null
      ))}

      {first ? <em className="comment">None</em> : null}
    </>
  }
};

export default connect(mapStateToProps)(Missing)
