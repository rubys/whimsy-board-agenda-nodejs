import { Link } from "react-router-dom";
import React from "react";
import { connect } from 'react-redux';
import store from '../store';
import * as Actions from "../../actions.js";

function mapStateToProps(state) {
  return {
    role: state.server.user.role,
    env: state.server.env
  }
};

class Help extends React.Component {
  render() {
    return <div class="container">
      <h3>Keyboard shortcuts</h3>

      <dl className="row">
        <dt class="text-right col-sm-3 col-lg-2">left arrow</dt>
        <dd class="col-sm-9">previous page</dd>
        <dt class="text-right col-sm-3 col-lg-2">right arrow</dt>
        <dd class="col-sm-9">next page</dd>
        <dt class="text-right col-sm-3 col-lg-2">enter</dt>
        <dd class="col-sm-9">On Shepherd and Queue pages, go to the first report listed</dd>
        <dt class="text-right col-sm-3 col-lg-2">C</dt>
        <dd class="col-sm-9">Scroll to comment section (if any)</dd>
        <dt class="text-right col-sm-3 col-lg-2">I</dt>
        <dd class="col-sm-9">Toggle Info dropdown</dd>
        <dt class="text-right col-sm-3 col-lg-2">N</dt>
        <dd class="col-sm-9">Toggle Navigation dropdown</dd>
        <dt class="text-right col-sm-3 col-lg-2">A</dt>
        <dd class="col-sm-9">Navigate to the overall agenda page</dd>
        <dt class="text-right col-sm-3 col-lg-2">F</dt>
        <dd class="col-sm-9">Show flagged items</dd>
        <dt class="text-right col-sm-3 col-lg-2">M</dt>
        <dd class="col-sm-9">Show missing items</dd>
        <dt class="text-right col-sm-3 col-lg-2">Q</dt>
        <dd class="col-sm-9">Show queued approvals/comments</dd>
        <dt class="text-right col-sm-3 col-lg-2">S</dt>
        <dd class="col-sm-9">Show shepherded items (and action items)</dd>
        <dt class="text-right col-sm-3 col-lg-2">X</dt>
        <dd class="col-sm-9">Set the topic during a meeting (a.k.a. mark the spot)</dd>
        <dt class="text-right col-sm-3 col-lg-2">?</dt>
        <dd class="col-sm-9">Help (this page)</dd>

        {this.props.env === 'development' ? <>
          <dt class="text-right col-sm-3 col-lg-2">D</dt>
          <dd class="col-sm-9">Developer information / Documentation</dd>
        </> : null}
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
        <div class="form-check">
          <input class="form-check-input" type="radio" name="role" id={role} value={role.toLowerCase()} checked={role.toLowerCase() === this.props.role} onChange={this.setRole} />
          <label class="form-check-label" for={role}>{role}</label>
        </div>
      ))}</form>

      <br />
      <Link to="secrets">Insider Secrets / Advanced Help</Link>
    </div>
  };

  setRole = (event) => {
    store.dispatch(Actions.setRole(event.target.value));
  }
};

export default connect(mapStateToProps)(Help)
