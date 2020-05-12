import React from "react";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    user: state.server.user
  }
};

class TemplateVariable extends React.Component {
  render() {
    let { userid, username, role } = this.props.user;

    return <div class="container">
      <h1>JSX Templates - variable substitution</h1>

      <p>While syntaxes vary, templating engines in general take as input an
      object and a string.</p>

      <p>What templating engines do is to substitute identified marked sections
      in the string with values from the object.</p>

      <p>Consider the following:</p>

      <pre class="example">
        <code>{
          `<dl>
  <dt>id</dt>
  <dd>{ userid }</dd>
  <dt>name</dt>
  <dd>{ username }</dd>
  <dt>role</dt>
  <dd>{ role }</dd>
</dl>`
        }</code>
      </pre>

      <p><a href="https://reactjs.org/docs/introducing-jsx.html">JSX</a>&nbsp;
      templates would render this as follows:</p>

      <dl class="example">
        <dt>id</dt>
        <dd>{userid}</dd>
        <dt>name</dt>
        <dd>{username}</dd>
        <dt>role</dt>
        <dd>{role}</dd>
      </dl>

    </div>
  }
}

export default connect(mapStateToProps)(TemplateVariable);
