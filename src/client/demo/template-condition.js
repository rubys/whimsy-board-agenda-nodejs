import React from "react";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    people: Object.values(state.agenda)
      .find(item => item.title === "Roll Call").people
  }
};

class TemplateCondition extends React.Component {
  render() {
    let people = Object.entries(this.props.people)
      .map(([id, person]) => ({ ...person, id }));

    return <div class="container">
      <h1>JSX Templates - Conditions</h1>

      <p>With JSX, conditional processing can be done using the
      JavaScript&nbsp;
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator">Conditional (ternary) operator</a>:
      </p>

      <p>Consider the following:</p>

      <pre class="example">
        <code>{
          `<ul>
  {people.map(person => (
    person.role === 'director' ? <li>{person.name}</li> : null
  ))}
</ul>`
        }</code>
      </pre>

      <p>Given the same array of people from the Roll Call, JSX
      templates would render the above as follows:</p>

      <ul class="example">
        {people.map(person => (
          person.role === 'director'
            ? <li key={person.id}>{person.name}</li>
            : null
        ))}
      </ul>

      <p>
        While at first using <tt>map</tt> methods and ternary operators may seem, well, <em>klunky</em>,
        the focus of JSX seems to be to make easy things easy and hard things possible:
      </p>

      <ul>
        <li>
          <p>
            Most templates should not need more than simple variable substitution, conditions,
            and iteration.  If you find yourself needing more than that, that often is an indication
            that the component that defines the template should be broken up into multiple components.
          </p>
        </li>

        <li>
          <p>
            Should you happen to need it, the full power of JavaScript is available.  In particular, you
            can call methods and functions.  This is particularly handy when defining <tt>onClick</tt>&nbsp;
            and <tt>onChange</tt> event handlers.
          </p>
        </li>
      </ul>
    </div>
  }
}

export default connect(mapStateToProps)(TemplateCondition);
