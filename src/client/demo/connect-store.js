import React from "react";
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

function mapStateToProps(state) {
  return { count: state.server.pending.count }
}

class ConnectStore extends React.Component {

  render() {
    return <div class="container">
      <h1>Connecting to the REDUX store</h1>

      <p>React properties can come from other locations than from
      the parent component for an element.  One other place is
      from a Redux store.</p>

      <p>Consider the following example:</p>

      <pre class="example">
        <code>{
          `function mapStateToProps(state) {
  return {count: state.server.pending.count}
}

class Demo extends React.Component {
  render() {
    return <p>Current count is: {this.props.count}</p>;
  }
}

export default connect(mapStateToProps)(Demo);`
        }</code>
      </pre>

      <p>Such a component would render as follows:</p>

      <div class="example">
        <p>Current count is: {this.props.count}</p>
      </div>

      <p>While this may be underwhelming, the value you see will match the
      number of pending changes that you see in the title bar.  If you go
      back to the agenda and add a comment to an item and return to this page
      you will see a different value.</p>

      <p>You can read more about the&nbsp;
      <a href="https://react-redux.js.org/api/connect">connect</a>
      &nbsp;function or peruse the&nbsp;
      <Link to="/store">current store</Link>.</p>
    </div>
  }
}

export default connect(mapStateToProps)(ConnectStore);
