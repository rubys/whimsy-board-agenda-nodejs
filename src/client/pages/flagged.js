import AdditionalInfo from "../elements/additional-info.js";
import Agenda from "../models/agenda.js";
import Link from "../elements/link.js";
import Minutes from "../models/minutes.js";
import Pending from "../models/pending.js";
import React from "react";
import { Server } from "../utils.js";

//
// A page showing all flagged reports
//
// On the meeting day, also show reports that are missing or don't have enough
// preapprovals.
class Flagged extends React.Component {
  render() {
    let first = true;
    let meeting_day = Minutes.started || Agenda.meeting_day;

    return <>
      {meeting_day ? <p>
        Currently showing 
        <span className="commented">flagged</span>
        , 
        <span className="missing">missing</span>
        , and 
        <span className="ready">unapproved</span>
         reports.
      </p> : <p>
        Currently only showing 
        <span className="commented">flagged</span>
        reports. Starting with the meeting day, this list will also include 
        <span className="missing">missing</span>
        , and 
        <span className="ready">unapproved</span>
         reports too.
      </p>}

      {Agenda.index.map((item) => {
        let flagged = item.flagged_by || Pending.flagged.includes(item.attach);
        let flagged_by;

        if (!flagged && meeting_day && /^(\d+|[A-Z]+)$/m.test(item.attach)) {
          flagged = !item.skippable
        };

        if (flagged) return <>
          <h3 className={item.color}>
            <Link text={item.title} href={`flagged/${item.href}`} className={first ? "default" : null}/>
            {first = false}
            <span className="owner">{` [${item.owner} / ${item.shepherd}]`}</span>
            {flagged_by = Server.directors[item.flagged_by] || item.flagged_by}
            {flagged_by ? <span className="owner">{` flagged by: ${flagged_by}`}</span> : null}
          </h3>;

          return <AdditionalInfo item={item} prefix={true}/>
        </>;

        return null
      })}

      {first ? <em className="comment">None</em> : null}
    </>
  }
};

export default Flagged