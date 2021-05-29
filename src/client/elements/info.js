import { Link } from "react-router-dom";
import React from "react";

function Info(props) {
  let chair = props.item.chair_email?.split("@")?.[0];

  return <dl className={"row " + (props.position || '')}>
    <dt className="col-sm-3">Attach</dt>
    <dd className="col-sm-9">{props.item.attach}</dd>

    {props.item.owner ? <>
      <dt className="col-sm-3">Author</dt>

      <dd className="col-sm-9">
      {chair && (props.item.chair_email.split("@")[1] === "apache.org")
         ? <a href={`https://whimsy.apache.org/roster/committer/${chair}`}>{props.item.owner}</a>
         : props.item.owner}
      </dd>
    </> : null}

    {props.item.shepherd ? <>
      <dt className="col-sm-3">Shepherd</dt>
      <dd className="col-sm-9">{props.item.shepherd ? <Link to={`shepherd/${props.item.shepherd.split(" ")[0]}`}>{props.item.shepherd}</Link> : null}</dd>
    </> : null}

    {props.item.status.flagged_by && props.item.status.flagged_by.length !== 0 ? <>
      <dt className="col-sm-3">Flagged By</dt>
      <dd className="col-sm-9">{props.item.status.flagged_by.join(", ")}</dd>
    </> : null}

    {props.item.status.approved_by && props.item.status.approved_by.length !== 0 ? <>
      <dt className="col-sm-3">Approved By</dt>
      <dd className="col-sm-9">{props.item.status.approved_by.join(", ")}</dd>
    </> : null}

    {props.item.roster || props.item.prior_reports || props.item.stats ? <>
      <dt className="col-sm-3">Links</dt>

      {props.item.roster ? <dd className="col-sm-9">
        <a href={props.item.roster}>Roster</a>
      </dd> : null}

      {props.item.prior_reports ? <dd className="col-sm-9">
        <a href={props.item.prior_reports}>Prior Reports</a>
      </dd> : null}

      {props.item.stats ? <dd className="col-sm-9">
        <a href={props.item.stats}>Statistics</a>
      </dd> : null}
    </> : null}
  </dl>
};

export default Info
