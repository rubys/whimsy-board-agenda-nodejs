import React from "react";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    user: state.server.user
  }
};

class DemoObject extends React.Component {
  render() {
    return <div class="demo container">
      <h1>Objects</h1>

      <p>Consider the following:</p>

      <pre class="example"><code>
        {
          `{\n  ${
          Object.entries(this.props.user).map(([name, value]) => (
            `${name}: ${JSON.stringify(value)}`
          )).join(',\n  ')
          }\n}`
        }
      </code></pre>

      <p>JavaScript calls this an <em>object</em>. Other languages may call
      this a hash, map, or dictionary.</p>

      <p>This truly is an object in that it can have methods, but for now
      we are only focusing on simple objects that only contain strings, numbers,
      arrays, and other simple objects.</p>

      <p>You can find out more at {' '}
      <a href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Basics">JavaScript object basics</a>.
      </p>
    </div>
  }
}

export default connect(mapStateToProps)(DemoObject);
