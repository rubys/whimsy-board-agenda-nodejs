import React from 'react';
import { Link } from "react-router-dom";

class Docs extends React.Component {
  render() {
    let walkthrough = "https://github.com/rubys/whimsy-board-agenda-nodejs/blob/master/docs/walkthrough/"

    return <div class="container">
      <h1>Documentation/Guides</h1>

      <h3>Available now</h3>

      <dl class="row">
        <dt class="col-sm-2"><Link to="/demo/">React/Redux Demo</Link></dt>
        <dd class="col-sm-10">
          <p>A live demo of the <a href="https://react-redux.js.org/">React Redux</a> store.</p>

          <p>Shows how to define a <a href="https://reactjs.org/docs/introducing-jsx.html">JSX</a> template,
          and to render a live view using a template, state data, and data from a React Redux store.</p>
        </dd>

        <dt class="col-sm-2"><a href={`${walkthrough}/refresh.md`}>Refresh Walkthrough</a></dt>
        <dd class="col-sm-10">
          <p>A full-stack walkthrough of refreshing the agenda from the latest svn, initiated by
          pressing <tt>R</tt> on the keyboard.</p>

          <p>This walkthrough is meant to merely be skimmed, optionally diving into specific areas
          of interest.  Understanding how the pieces are put together will make it easier to
          locate where to make changes.</p>
        </dd>
      </dl>

      <h3>Planned/Coming Soon</h3>

      <dl class="row">
        <dt class="col-sm-2">Add Comment Walkthrough</dt>
        <dd class="col-sm-10">
          <p>A walkthrough on adding a comment to report.</p>

          <p>This will show how buttons and forms work.</p>
        </dd>

        <dt class="col-sm-2">Agenda Reducer</dt>
        <dd class="col-sm-10">
          <p>A walkthrough of the Agenda <a href="https://redux.js.org/basics/reducers">Reducer</a>.</p>

          <p>This will show how multiple streams of <a href="https://redux.js.org/basics/actions">actions</a>
          are processed to provide a coherent and up to date view of Agenda items for rendering.</p>
        </dd>
      </dl>
    </div>
  }
}

export default Docs;