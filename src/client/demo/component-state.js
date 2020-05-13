import React from "react";

class ComponentCondition extends React.Component {

  state = { count: 0 };

  render() {
    return <div class="demo container">
      <h1>Component - State</h1>

      <p>A React component couples state with a render method that uses JSX:</p>

      <p>Consider the following:</p>

      <pre class="example">
        <code>{
          `class Demo extends React.Component {
  state = { count : 0 };

  render() {
    return <>
      <button onClick={this.increment}>Increment</button>
      <p>Current count is: {this.state.count}</p>
    </>
  }

  increment = () => {
    setState({ count: this.state.count + 1 })
  }
}`
        }</code>
      </pre>

      <p>Such a component would render as follows:</p>

      <div class="example">
        <button onClick={this.increment}>Increment</button>
        <p>Current count is: {this.state.count}</p>
      </div>

      <p>Go ahead and click the button a few times.</p>

      <p>React components are <em>reactive</em> in that they rerender the template
      any time state is updated.</p>

      <p>Clicking the button will cause <tt>this.increment</tt> to be called.
      Calling <tt>this.increment</tt> will cause the state to be changed, specifically
      it will increment <tt>count</tt>.  Changing the state will cause the
      template to be rerendered.</p>

      <p>This is accomplished via the use of a {' '}
        <a href="https://reactjs.org/docs/faq-internals.html">Virtual DOM</a>.
      </p>

      <p>Note: the above 
         {' '}<a href="https://reactjs.org/docs/react-component.html#render">render</a> method returns a 
         {' '}<a href="https://reactjs.org/docs/fragments.html">React Fragment</a>.</p>
    </div>
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 })
  }

}

export default ComponentCondition;
