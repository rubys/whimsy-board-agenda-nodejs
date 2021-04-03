import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import AddComment from "../buttons/add-comment.js";

function mapStateToProps(state) {
  return {
    incubator: state.agenda?.Incubator,
    count: state.server.pending.count
  }
}

function ConnectStore({ incubator, count }) {

  let button = AddComment.button;
  let label = incubator?.status?.pending?.comments ? 'edit comment' : 'add comment';

  return <div class="demo container">
    <h1>Connecting to the REDUX store</h1>

    <p>React properties can come from other locations than from
    the parent component for an element.  One such other place is
    from a Redux store.</p>

    <p>Consider the following example:</p>

    <pre class="example">
      <code>{
        `function mapStateToProps(state) {
  return {count: state.server.pending.count}
}

function Demo({{ count }) {
  return <p>Current count is: {count}</p>;
}

export default connect(mapStateToProps)(Demo);`
      }</code>
    </pre>

    <p>Such a component would render as follows:</p>

    <div class="example">
      <p>Current count is: {count}</p>
    </div>

    <p>The value you see will match the
    number of pending changes that you see in the title bar.  You can
    click on the following button to add or delete a pending comment
    on the Incubator report and see the value change</p>

    <p>
      <button data-toggle="modal" data-target={button.data_target}>{label}</button>
      <AddComment item={incubator} />
    </p>

    <p>If you look in the <Link to="/store">store</Link> under <tt>server.pending</tt>, you
    will see the <tt>count</tt> as well as any pending comments you may have.  You can also
    see your pending comment on the <Link to="/Incubator">Incubator</Link> report.
    Feel free to add or remove a comment on a different report and return to this page.
    The pending count will always match.</p>

    <p>You can read more about the {' '}
    <a href="https://react-redux.js.org/api/connect">connect</a>
    {' '} function.</p>
  </div>
}

export default connect(mapStateToProps)(ConnectStore);
