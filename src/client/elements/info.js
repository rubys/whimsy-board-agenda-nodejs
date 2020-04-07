import { Link } from "react-router-dom";
import React from "react";

class Info extends React.Component {
  render() {
    let chair;
    
    return <dl className={"row " + (this.props.position || '')}>
      <dt className="col-sm-3">Attach</dt>
      <dd className="col-sm-9">{this.props.item.attach}</dd>

      {this.props.item.owner ? <>
        <dt className="col-sm-3">Author</dt>

        {(this.props.item.chair_email || "").split("@")[1] === "apache.org" ? <>
          {chair = this.props.item.chair_email.split("@")[0]}

          <dd className="col-sm-9">
            <a href={`https://whimsy.apache.org/roster/committer/${chair}`}>{this.props.item.owner}</a>
          </dd>
        </> : <dd className="col-sm-9">{this.props.item.owner}</dd>}
      </> : null}

      {this.props.item.shepherd ? <>
        <dt className="col-sm-3">Shepherd</dt>
        <dd className="col-sm-9">{this.props.item.shepherd ? <Link to={`shepherd/${this.props.item.shepherd.split(" ")[0]}`}>{this.props.item.shepherd}</Link> : null}</dd>
      </> : null}

      {this.props.item.flagged_by && this.props.item.flagged_by.length !== 0 ? <>
        <dt className="col-sm-3">Flagged By</dt>
        <dd className="col-sm-9">{this.props.item.flagged_by.join(", ")}</dd>
      </> : null}

      {this.props.item.approved && this.props.item.approved.length !== 0 ? <>
        <dt className="col-sm-3">Approved By</dt>
        <dd className="col-sm-9">{this.props.item.approved.join(", ")}</dd>
      </> : null}

      {this.props.item.roster || this.props.item.prior_reports || this.props.item.stats ? <>
        <dt className="col-sm-3">Links</dt>

        {this.props.item.roster ? <dd className="col-sm-9">
          <a href={this.props.item.roster}>Roster</a>
        </dd> : null}

        {this.props.item.prior_reports ? <dd className="col-sm-9">
          <a href={this.props.item.prior_reports}>Prior Reports</a>
        </dd> : null}

        {this.props.item.stats ? <dd className="col-sm-9">
          <a href={this.props.item.stats}>Statistics</a>
        </dd> : null}
      </> : null}
    </dl>
  }
};

export default Info