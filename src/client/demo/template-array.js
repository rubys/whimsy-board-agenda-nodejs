import React from "react";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    people: Object.values(state.agenda)
      .find(item => item.title === "Roll Call").people
  }
};

class TemplateArray extends React.Component {

  render() {
    let people = Object.entries(this.props.people)
      .map(([id, person]) => ({ ...person, id }));

    return <div class="container">
      <h1>JSX Templates - Iteration</h1>

      <p>Now consider an array of objects.  Wih JSX, iteration is done using the
      JavaScript&nbsp;
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map">Array.map</a>
      &nbsp;method:
      </p>

      <p>Consider the following:</p>

      <pre class="example">
        <code>{
          `<table>
  <thead>
    <tr>
      <th>id</th>
      <th>name</th>
      <th>role</th>
    </tr>
  </thead>

  <tbody>
     {people.map(person => (
        <tr key={person.id}>
          <td>{person.id}</td>
          <td>{person.name}</td>
          <td>{person.role}</td>
        </tr>
     ))}
  </tbody>
</table>`
        }</code>
      </pre>

      <p>Given an array of people, for example from the Roll Call of the
      current agenda, JSX templates would render the above as follows:</p>

      <table class="example table">
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>role</th>
          </tr>
        </thead>

        <tbody>
          {people.map(person => (
            <tr key={person.id}>
              <td>{person.id}</td>
              <td>{person.name}</td>
              <td>{person.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Observant readers will have noted a <tt>key</tt> attribute on the
      &nbsp;<tt>&lt;tr&gt;</tt> element.&nbsp;
      <a href="https://reactjs.org/docs/lists-and-keys.html#keys">keys</a>
      &nbsp;help React identify which items have changed, are added, or
      are removed.</p>
    </div>
  }
}

export default connect(mapStateToProps)(TemplateArray);
