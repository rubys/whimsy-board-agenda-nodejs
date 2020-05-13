import React from "react";
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

function mapStateToProps(state) {
  return {
    people: Object.values(state.agenda)
      .find(item => item.title === "Roll Call").people
  }
};

class TemplateIteration extends React.Component {

  render() {
    let people = Object.entries(this.props.people)
      .map(([id, person]) => ({ ...person, id }));

    return <div class="demo container">
      <h1>JSX Templates - Iteration</h1>

      <p>Now consider an array of objects.  Wih JSX, iteration is done using the
      JavaScript {' '}
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map">Array.map</a>
      {' '} method:
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

      <p>Given an array of people, for example from the {' '}
      <Link to="/Roll-Call">Roll Call</Link> of the current agenda,
      {' '} JSX templates would render the above as follows:</p>

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
       {' '}<tt>&lt;tr&gt;</tt> element. {' '}
      <a href="https://reactjs.org/docs/lists-and-keys.html#keys">keys</a>
       {' '}help React identify which items have changed, are added, or
      are removed.</p>
    </div>
  }
}

export default connect(mapStateToProps)(TemplateIteration);
