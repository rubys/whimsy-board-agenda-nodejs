import React from "react";

class ComponentProps extends React.Component {

  state = { count: 0 };

  render() {
    return <div class="container">
      <h1>Component - Properties</h1>

      <p>A React component can pass state as a property to another
      component.</p>

      <p>Modifying the previous example only slightly to introduce a
      second component:</p>

      <pre class="example">
        <code>{
          `class Demo extends React.Component {
  state = { count : 0 };

  render() {
    return <>
      <button onClick={this.increment}>Increment</button>
      <DisplayCount count={this.state.count} />
    </>
  }

  increment = () => {
    setState({ count: this.state.count + 1 })
  }
}

class DisplayCount extends React.component {
  render() {
    return <p>Current count is: {this.props.count}</p>;
  }
}`
        }</code>
      </pre>

      <p>Such a component would render identically as befores:</p>

      <div class="example">
        <button onClick={this.increment}>Increment</button>
        <DisplayCount count={this.state.count} />
      </div>

      <p>Once again, click the button a few times.</p>

      <p>React components are <em>reactive</em> in that they rerender the template
      any time state <b>or properties</b> are updated.</p>

    </div>
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 })
  }

}

class DisplayCount extends React.Component {
  render() {
    return <p>Current count is: {this.props.count}</p>;
  }
}

export default ComponentProps;
