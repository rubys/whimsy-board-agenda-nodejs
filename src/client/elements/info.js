import Link from "./link.js";
import React from "react";

class Info extends React.Component {
  render() {
    let chair;
    
    return <dl className={"dl-horizontal " + this.props.position}>
      <dt>Attach</dt>
      <dd>{this.props.item.attach}</dd>

      {this.props.item.owner ? <>
        <dt>Author</dt>

        {(this.props.item.chair_email || "").split("@")[1] === "apache.org" ? <>
          {chair = this.props.item.chair_email.split("@")[0]}

          <dd>
            <a href={`https://whimsy.apache.org/roster/committer/${chair}`}>{this.props.item.owner}</a>
          </dd>
        </> : <dd>{this.props.item.owner}</dd>}
      </> : null}

      {this.props.item.shepherd ? <>
        <dt>Shepherd</dt>
        <dd>{this.props.item.shepherd ? <Link text={this.props.item.shepherd} href={`shepherd/${this.props.item.shepherd.split(" ")[0]}`}/> : null}</dd>
      </> : null}

      {this.props.item.flagged_by && this.props.item.flagged_by.length !== 0 ? <>
        <dt>Flagged By</dt>
        <dd>{this.props.item.flagged_by.join(", ")}</dd>
      </> : null}

      {this.props.item.approved && this.props.item.approved.length !== 0 ? <>
        <dt>Approved By</dt>
        <dd>{this.props.item.approved.join(", ")}</dd>
      </> : null}

      {this.props.item.roster || this.props.item.prior_reports || this.props.item.stats ? <>
        <dt>Links</dt>

        {this.props.item.roster ? <dd>
          <a href={this.props.item.roster}>Roster</a>
        </dd> : null}

        {this.props.item.prior_reports ? <dd>
          <a href={this.props.item.prior_reports}>Prior Reports</a>
        </dd> : null}

        {this.props.item.stats ? <dd>
          <a href={this.props.item.stats}>Statistics</a>
        </dd> : null}
      </> : null}
    </dl>
  }
};

export default Info