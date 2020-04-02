import AdditionalInfo from "../elements/additional-info.js";
import Agenda from "../models/agenda.js";
import Link from "../elements/link.js";
import React from "react";
import { Server } from "../utils.js";

//
// A page showing all flagged reports
//
class Missing extends React.Component {
  state = { checked: {} };

  // update check marks based on current Index
  beforeMount() {
    for (let item of Agenda.index) {
      if (typeof this.state.checked[item.title] === 'undefined') {
        this.setState('checked', {...this.state.checked, [item.title]: true})
      }
    }
  };

  render() {
    let first = true;
    let flagged_by;

    return <>
      {Agenda.index.map((item) => (
        item.missing && item.owner && item.nonresponsive ? <>
          {first ? <h2>Non responsive PMCs</h2> : null}

          <h3 className={item.color}>
            {/^[A-Z]+/m.test(item.attach) ? <input className="inactive" type="checkbox" name="selected" value={item.title} checked={this.state.checked[item.title]} /> : null}
            <Link text={item.title} href={`flagged/${item.href}`} className={first ? "default" : null} />
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

      {Agenda.index.map((item) => (
        item.missing && item.owner && !item.nonresponsive ? <>
          <h3 className={item.color}>
            {/^[A-Z]+/m.test(item.attach) ? <input className="active" type="checkbox" name="selected" value={item.title} checked={this.state.checked[item.title]} /> : null}
            <Link text={item.title} href={`flagged/${item.href}`} className={first ? "default" : null} />
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

export default Missing