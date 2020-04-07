import AdditionalInfo from "../elements/additional-info.js";
import Agenda from "../models/agenda.js";
import { Link } from "react-router-dom";
import React from "react";

//
// A page showing all reports that were NOT accepted
//
class Rejected extends React.Component {
  render() {
    let first = true;

    return <>
      {Agenda.index.map((item) => <>
        {item.rejected ? <>
          <h3 className={item.color}>
            <Link to={`flagged/${item.href}`} className={first ? "default" : null}>{item.title}</Link>
            {first = false}
            <span className="owner">{` [${item.owner} / ${item.shepherd}]`}</span>
          </h3>;

          <AdditionalInfo item={item} prefix={true} />
        </> : null}
      </>)}

      {first ? <em className="comment">None</em> : null}
    </>
  }
};

export default Rejected