import React, { useState } from "react";

function ComponentState() {
  let [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1)
  };

  return <div class="demo container">
    <h1>Component - State</h1>

    <p>A React component can be as simple as a JavaScript function that
    has state and returns JSX.</p>

    <p>Consider the following:</p>

    <pre class="example">
      <code>{
        `function Demo {
  let [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1)
  }

  return <>
    <button onClick={increment}>Increment</button>
    <p>Current count is: {count}</p>
  </>
}`
      }</code>
    </pre>

    <p>Such a component would render as follows:</p>

    <div class="example">
      <button onClick={increment}>Increment</button>
      <p>Current count is: {count}</p>
    </div>

    <p>Go ahead and click the button a few times.</p>

    <p>React components are <em>reactive</em> in that they re-render the template
    any time state is updated.</p>

    <p>Clicking the button will cause <tt>increment</tt> to be called.
    Calling <tt>increment</tt> will cause the state to be changed.
    Changing the state will cause the template to be re-rendered.</p>

    <p>This is accomplished via the use of a {' '}
      <a href="https://reactjs.org/docs/faq-internals.html">Virtual DOM</a>.
    </p>

    <p>Note: the <tt>Demo</tt> function above makes use of the
       {' '}<a href="https://reactjs.org/docs/hooks-state.html">useState</a> hook and returns a
       {' '}<a href="https://reactjs.org/docs/fragments.html">React Fragment</a>.</p>
  </div>
}

export default ComponentState;
