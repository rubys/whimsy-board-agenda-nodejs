import React from "react";

class Conclusion extends React.Component {
  render() {
    return <div class="container">
      <h1>Conclusions</h1>

      <p>With most templating engines, a template plus a snapshot of data equals static HTML.</p>

      <p>With React/Redux/JSX, a template plus live data equals a live view.</p>

      <p>This reduces most problems to:</p>

      <ul>

        <li>
          <p>Getting correct data into the store.  That is beyond the scope of this demo,
            but covered by later walkthroughs.  The beauty of this approach is that you con
            directly examine the store and verify its contents.
          </p>
        </li>

        <li>
          <p>Defining a method to render the data, along with any state and event handlers
            for things like clicking buttons and changing text.
          </p>
        </li>
      </ul>
    </div>
  }
}

export default Conclusion