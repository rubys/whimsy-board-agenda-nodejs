import React, { useState } from "react";

function ComponentProps() {
  let [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1)
  };

  return <div class="demo container">
    <h1>Component - Properties</h1>

    <p>A React component can pass state as a property to another
    component.</p>

    <p>Modifying the previous example only slightly to introduce a
    second component:</p>

    <pre class="example">
      <code>{
        `function Demo() {
  let [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1)
  }

  return <>
    <button onClick={increment}>Increment</button>
    <DisplayCount count={count} />
  </>
}

function DisplayCount({ count }) {
  return <p>Current count is: {count}</p>;
}`
      }</code>
    </pre>

    <p>In the above, the <tt>Demo</tt> component passes {' '}
    <tt>count</tt> as <tt>count</tt> to the {' '}
    <tt>DisplayCount</tt> component.</p>

    <p>Such a component would render identically as befores:</p>

    <div class="example">
      <button onClick={increment}>Increment</button>
      <DisplayCount count={count} />
    </div>

    <p>Once again, click the button a few times.</p>

    <p>React components are <em>reactive</em> in that they rerender the template
    any time state <b>or properties</b> are updated.</p>

  </div>
}

function DisplayCount({ count }) {
  return <p>Current count is: {count}</p>;
}

export default ComponentProps;
