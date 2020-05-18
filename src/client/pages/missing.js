import AdditionalInfo from "../elements/additional-info.js";
import { Link } from "react-router-dom";
import React, { Fragment } from "react";
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
        item.status.missing && item.owner && item.status.nonresponsive ? <Fragment key={item.href}>
          {first ? <h2>Non responsive PMCs</h2> : null}

          <h3 className={`${item.status.color} form-check`}>
            {/^[A-Z]+/m.test(item.attach) ? <input className="form-check-input inactive" type="checkbox" name="selected" value={item.title} defaultChecked={this.state.checked[item.title]} /> : null}
            <Link to={`flagged/${item.href}`} className={first ? "default" : null}>{item.title}</Link>
            {first = false}
            <span className="owner">{` [${item.owner} / ${item.shepherd}]`}</span>

            {item.flagged_by ? <>
              {flagged_by = Server.directors[item.flagged_by] || item.flagged_by}
              <span className="owner">{` flagged by: ${flagged_by}`}</span>
            </> : null}
          </h3>

          <AdditionalInfo item={item} prefix={true} />
        </Fragment> : null
      ))}

      {!first ? <h2>Other missing reports</h2> : null}

      {agenda.map(item => (
        item.status.missing && item.owner && !item.status.nonresponsive ? <Fragment key={item.href}>
          <h3 className={`${item.status.color} form-check`}>
            {/^[A-Z]+/m.test(item.attach) ? <input className="active form-check form-check-input" type="checkbox" name="selected" value={item.title} defaultChecked={this.state.checked[item.title]} /> : null}
            <Link to={`flagged/${item.href}`} className={first ? "default" : null}>{item.title}</Link>
            {first = false}
            <span className="owner">{` [${item.owner} / ${item.shepherd}]`}</span>

            {item.flagged_by ? <>
              {flagged_by = Server.directors[item.flagged_by] || item.flagged_by}
              <span className="owner">{` flagged by: ${flagged_by}`}</span>
            </> : null}
          </h3>

          <AdditionalInfo item={item} prefix={true} />
        </Fragment> : null
      ))}

      {first ? <em className="comment">None</em> : null}
    </>
  }
};

export default connect(mapStateToProps)(Missing)
