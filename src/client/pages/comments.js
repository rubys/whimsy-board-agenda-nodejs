import { Link } from "react-router-dom";
import MarkSeen from "../buttons/markseen.js";
import Pending from "../models/pending.js";
import React from "react";
import ShowSeen from "../buttons/showseen.js";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    agenda: state.agenda,
    pending: state.server.pending
  }
};

//
// A page showing all comments present across all agenda items
// Conditionally hide comments previously marked as seen.
//
// TODO: buttons, showseen (default to false)

class Comments extends React.Component {
  static get xbuttons() {
    let buttons = [];

    if (MarkSeen.undo || Object.values(this.props.agenda).some(item => !item.unseen_comments.empty)) {
      buttons.push({ button: MarkSeen })
    };

    if (Pending.seen && Object.keys(Pending.seen).length === 0) {
      buttons.push({ button: ShowSeen })
    };

    return buttons
  };

  state = { showseen: true };

  toggleseen() {
    this.setState({ showseen: !this.state.showseen })
  };

  render() {
    let found = false;

    return <>
      {Object.values(this.props.agenda).map(item => {
        if (!item.comments?.length) return null;
        let visible = this.state.showseen ? item.comments : item.unseen_comments;

        if (visible?.length) {
          found = true;

          return <section key={item.href}>
            <Link to={item.href} className={`h4 ${item.color}`}>{item.title}</Link>
            {visible.map(comment => <pre className="comment" key={comment}>{comment}</pre>)}
          </section>
        } else {
          return null
        }
      })}

      {!found ? <p>{Object.keys(Pending.seen).length === 0 ? <em>No comments found</em> : <em>No new comments found</em>}</p> : null}
    </>
  }
};

export default connect(mapStateToProps)(Comments)