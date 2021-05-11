import React from 'react';
import { Link } from "react-router-dom";

function Docs() {
  let overview = "https://github.com/apache/infrastructure-agenda/blob/master/docs/overview"
  let walkthrough = "https://github.com/apache/infrastructure-agenda/blob/master/docs/walkthrough"

  return <div className="container">
    <h1>Documentation/Guides</h1>

    <h3>Demo</h3>

    <dl className="row">
      <dt className="col-sm-2"><Link to="/demo/">React/Redux</Link></dt>
      <dd className="col-sm-10">
        <p>A live demo of the <a href="https://react-redux.js.org/">React Redux</a> store.</p>

        <p>Shows how to define a <a href="https://reactjs.org/docs/introducing-jsx.html">JSX</a> template,
        and to render a live view using a template, state data, and data from a React Redux store.</p>
      </dd>
    </dl>

    <h3>Overview</h3>

    <dl className="row">
      <dt className="col-sm-2">
        <a href={`${overview}/concepts.md#concepts`}>Concepts</a>
      </dt>
      <dd className="col-sm-10">
        <p>A high level description of the major architectural components</p>
      </dd>

      <dt className="col-sm-2">
        <a href={`${overview}/development.md#development`}>Development Workflow</a>
      </dt>
      <dd className="col-sm-10">
        <p>Overview of the various development tasks.  Covers:</p>

        <ul>
          <li>Isolating problems</li>
          <li>Edit, compile, debug</li>
          <li>Testing</li>
          <li>Package management</li>
        </ul>
      </dd>

      <dt className="col-sm-2">
        <a href={`${overview}/environments.md#runtime-environments`}>Environments</a>
      </dt>
      <dd className="col-sm-10">
        <p>A description of the differences between the development,
        test, and production environments.</p>
      </dd>

      <dt className="col-sm-2">
        <a href={`${overview}/performance.md#preface`}>Performance</a>
      </dt>
      <dd className="col-sm-10">
        <p>An overview of how the board agenda tool achieves high performance
        by defering and avoiding server interactions whenever possible.</p>
      </dd>
    </dl>

    <h3>Walk-throughs</h3>

    <dl className="row">
      <dt className="col-sm-2">
        <a href={`${walkthrough}/refresh.md#refreshing-the-agenda`}>Refresh</a>
      </dt>
      <dd className="col-sm-10">
        <p>A full-stack walkthrough of refreshing the agenda from the latest svn, initiated by
        pressing <tt>R</tt> on the keyboard.</p>

        <p>This walkthrough is meant to merely be skimmed, optionally diving into specific areas
        of interest.  Understanding how the pieces are put together will make it easier to
        locate where to make changes.</p>
      </dd>

      <dt className="col-sm-2">
        <a href={`${walkthrough}/add-comment.md#adding-a-comment-to-a-pmc-report`}>Add Comment</a>
      </dt>
      <dd className="col-sm-10">
        <p>A walkthrough on adding a comment to report.</p>

        <p>This provides more detail with an actual example of how to
        wire up buttons, forms, and operations to work together.</p>
      </dd>

      <dt className="col-sm-2">
        <a href={`${walkthrough}/test-attend.md#testing-the-attend-server-side-operation`}>Test Attend</a>
      </dt>
      <dd className="col-sm-10">
        <p>A walkthrough of the test suite for the <tt>attend</tt>{' '}
        button that appears at the bottom of <em>Roll Call</em> pages..</p>

        <p>This covers mocking of inputs from subversion and verifing
        that the results of the operation are what is expected..</p>
      </dd>

      <dt className="col-sm-2">
        <a href={`${walkthrough}/websocket.md#websockets`}>WebSocket</a>
      </dt>
      <dd className="col-sm-10">
        <p>Covers:</p>
        <ul>
          <li>Startup / Authentication</li>
          <li>Sharing WebSockets between Tabs</li>
          <li>Server API</li>
          <li>Client Routing</li>
          <li>Development WebSocket</li>
        </ul>
      </dd>

      <dt className="col-sm-2">
        <a href={`${walkthrough}/redux-store.md#redux-store`}>Redux Store</a>
      </dt>
      <dd className="col-sm-10">
        <p>A description of the information stored in the {' '}
          <Link to="/store">Redux store</Link>.</p>
      </dd>

      <dt className="col-sm-2">
        <a href={`${walkthrough}/reducers.md#agenda-reducer`}>Agenda Reducer</a>
      </dt>
      <dd className="col-sm-10">
        <p>A walkthrough of the Agenda <a href="https://redux.js.org/basics/reducers">Reducer</a>.</p>

        <p>This shows how multiple streams of <a href="https://redux.js.org/basics/actions">actions</a>
        {' '} are processed to provide a coherent and up to date view of Agenda items for rendering.</p>
      </dd>

      <dt className="col-sm-2">
        <a href={`${walkthrough}/source.md#Source-Tree`}>Source</a>
      </dt>
      <dd className="col-sm-10">
        <p>A description of various source directories and key source files.</p>
      </dd>
    </dl>

    <h3>Other resources</h3>

    <p>
      This project was bootstrapped with <a href="https://github.com/facebook/create-react-app">Create React App</a>.
      You can learn more in the <a href="https://facebook.github.io/create-react-app/docs/getting-started">Create React App documentation</a>.
    </p>

    <h5>Significant components:</h5>
    <ul>
      <li><a href="https://getbootstrap.com/">Bootstrap</a> styles</li>
      <li><a href="https://expressjs.com/">Express</a> web framework</li>
      <li><a href="https://nodejs.org/en/docs/guides/">Node.js</a> [<a href="https://nodejs.dev/">tutorial</a>] Server-side JavaScript runtime</li>
      <li><a href="https://reactjs.org/">React</a> [<a href="https://reactjs.org/tutorial/tutorial.html">tutorial</a>] user interface library</li>
      <li><a href="https://react-redux.js.org/">React Redux</a> predictable state container</li>
      <li><a href="https://reacttraining.com/react-router/">React Router</a> declarative routing</li>
    </ul>

    <h5>Supporting cast:</h5>
    <ul>
      <li><a href="https://babeljs.io/">babel</a> javascript transpiler</li>
      <li><a href="https://www.npmjs.com/package/express-ws">express-ws</a> websocket support</li>
      <li><a href="https://jestjs.io/">jest</a> testing framework</li>
      <li><a href="https://jquery.com/">jQuery</a> library for DOM traversal and manipulation</li>
      <li><a href="http://ldapjs.org/">ldapjs</a> LDAP client</li>
      <li><a href="https://webpack.js.org/">webpack</a> module bundler</li>
      <li><a href="https://yarnpkg.com/">yarn</a> package manager</li>
    </ul>

    <h5>Relatively new and notable JavaScript features:</h5>
    <ul>
      <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules">JavaScript modules</a></li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promise</a></li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring">Object destructuring</a></li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax">spread syntax</a></li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions">arrow function expressions</a></li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#New_notations_in_ECMAScript_2015">shorthand and computed property names</a></li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals">Template literals (Template strings)</a></li>
    </ul>
  </div>
}

export default Docs;
