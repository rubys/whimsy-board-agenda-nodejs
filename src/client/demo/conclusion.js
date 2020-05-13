import React from "react";

class Conclusion extends React.Component {
  render() {
    return <div class="demo container">
      <h1>Conclusions</h1>

      <p>With most templating engines, a template plus a snapshot of data equals static HTML.</p>

      <p>With React/Redux/JSX, a template plus live data equals a live view.</p>

      <p>This reduces most problems to:</p>

      <ul>

        <li>
          <p>Getting correct data into the store.  That is beyond the scope of this demo,
            but covered by later walk-throughs.  The beauty of this approach is that you can
            directly examine the store and verify its contents.
          </p>
        </li>

        <li>
          <p>Defining a method to render the data, along with any state and event handlers
            for things like clicking buttons and changing text.
          </p>
        </li>
      </ul>

      <p>You may be interested in perusing the {' '}
        <a href="https://github.com/rubys/whimsy-board-agenda-nodejs/tree/master/src/client/demo">source</a> {' '}
      to this demo.  The demo is implemented using the techniques described in the demo itself.  In particular,
      it pulled your information from the server, the list of attendees from this month's roll call,
      and the pending count is based on whatever comments, approvals, etc. you may have pending at this time.</p>
    </div>
  }
}

export default Conclusion
