import { Link } from "react-router-dom";
import React from "react";
import User from "../models/user.js";

class Help extends React.Component {
  render() {
    return <>
      <h3>Keyboard shortcuts</h3>

      <dl className="dl-horizontal">
        <dt>left arrow</dt>
        <dd>previous page</dd>
        <dt>right arrow</dt>
        <dd>next page</dd>
        <dt>enter</dt>
        <dd>On Shepherd and Queue pages, go to the first report listed</dd>
        <dt>C</dt>
        <dd>Scroll to comment section (if any)</dd>
        <dt>I</dt>
        <dd>Toggle Info dropdown</dd>
        <dt>N</dt>
        <dd>Toggle Navigation dropdown</dd>
        <dt>A</dt>
        <dd>Navigate to the overall agenda page</dd>
        <dt>F</dt>
        <dd>Show flagged items</dd>
        <dt>M</dt>
        <dd>Show missing items</dd>
        <dt>Q</dt>
        <dd>Show queued approvals/comments</dd>
        <dt>S</dt>
        <dd>Show shepherded items (and action items)</dd>
        <dt>X</dt>
        <dd>Set the topic during a meeting (a.k.a. mark the spot)</dd>
        <dt>?</dt>
        <dd>Help (this page)</dd>
      </dl>

      <h3>Common Actions</h3>

      <ul>
        <li>Blue buttons (or links) in bottom navbar (or at bottom of a report) are the primary actions you can take.</li>
        <li>Send Email merely opens your email client with a pre-formatted message to send; it does not change the agenda content.</li>
        <li>Simple Actions like Approve/Unapprove or Add Comment are queued locally; to commit them, click the red number in top navbar and Commit.</li>
        <li>Other Actions like Add Item (adding resolution, discussion item) or Post Report (to add a specific project report) are committed after you enter them.</li>
      </ul>

      <h3>Color Legend</h3>

      <ul>
        <li className="missing">Report missing, rejected, or has formatting errors</li>
        <li className="available">Report present, not eligible for pre-reviews</li>
        <li className="ready">Report present, ready for (more) review(s)</li>
        <li className="reviewed">Report has sufficient pre-approvals</li>
        <li className="commented">Report has been flagged for discussion</li>
      </ul>

      <h3>Change Role</h3>

      <form id="role">{["Secretary", "Director", "Guest"].map(role => (
        <div>
          <input type="radio" name="role" value={role.toLowerCase()} checked={role.toLowerCase() === User.role} onChange={this.setRole}/>
          {role}
        </div>
      ))}</form>

      <br/>
      <Link to="secrets">Insider Secrets / Advanced Help</Link>
    </>
  };

  setRole(event) {
    User.role = event.target.value;
  }
};

export default Help