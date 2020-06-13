import ActionItems from "../pages/action-items.js";
import AdditionalInfo from "../elements/additional-info.js";
import Email from "../buttons/email.js";
import { Link } from "react-router-dom";
import React from "react";
import { Server, splitComments, retrieve, post } from "../utils.js";
import store from '../store';
import * as Actions from "../../actions.js";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    user: state.server.user,
    agenda: state.agenda,
    agendaFile: state.client.agendaFile
  }
};

// A page showing all queued approvals and comments, as well as items
// that are ready for review.
//
class Shepherd extends React.Component {
  state = { disabled: false, followup: [] };

  render() {
    let shepherd = this.props.shepherd.toLowerCase();
    let actions = this.props.agenda["Action-Items"];

    let followup = [];

    Object.entries(this.state.followup).forEach(([item, title]) => {
      if (item.count !== 1) return;
      if (item.shepherd !== this.props.shepherd) return;
      if (Object.values(this.props.agenda).some(item => item.title === title)) return;
      item.title = title;
      followup.push(item)
    });

    return <div className="container">
      {actions.actions.some(action => action.owner === this.props.shepherd) ? <>
        <h2>Action Items</h2>
        <ActionItems item={actions} filter={{ owner: this.props.shepherd }} />
      </> : null}

      <h2>Committee Reports</h2>

      {Object.values(this.props.agenda).map((item) => {
        let mine = shepherd === this.props.user.firstname ? "btn-primary" : "btn-link";

        if (item.shepherd && item.shepherd.toLowerCase().startsWith(shepherd)) return <React.Fragment key={item.href}>
          <Link to={`/shepherd/queue/${item.href}`} className={`h3 ${item.status.color}`}>{item.title}</Link>
          <AdditionalInfo item={item} prefix={true} />

          {item.missing || item.comments?.length ?
            /^[A-Z]+$/m.test(item.attach) ?
              <div className="shepherd">
                <button className={"btn " + mine} data_attach={item.attach} onClick={this.click} disabled={this.state.disabled}>{item.flagged ? "unflag" : "flag"}</button>
                <Email item={item} />
              </div>
              : null
            : null}
        </React.Fragment>;

        return null
      })}

      {followup.length !== 0 ? <>
        <h2>Feedback that may require followup</h2>

        {followup.map((followup) => {
          let link = followup.title.replace(/[^a-zA-Z0-9]+/g, "-");

          return <>
            <a className="ready h3" href={`../${this.state.prior_date}/${link}`}>{followup.title}</a>;

            {splitComments(followup.comments).map(comment => (
              <pre className="comment">{comment}</pre>
            ))}
          </>;
        })}
      </> : null}
    </div>
  };

  // Fetch followup items
  componentDidMount() {
    // if cached, reuse
    if (Shepherd.followup) {
      this.setState({ followup: Shepherd.followup });
      return
    };

    // determine date of previous meeting
    let prior_agenda = Server.agendas[Server.agendas.length - 2];
    if (!prior_agenda) return;

    let prior_date = prior_agenda.match(/\d+_\d+_\d+/)[0].replace(/_/g, "-");

    retrieve(`../${prior_date}/followup.json`, "json", followup => {
      Shepherd.followup = followup;
      if (followup) this.setState({ followup })
    });

    this.setState({ prior_date })
  };

  click = event => {
    let data = {
      agenda: Object.values(this.props.agendaFile),
      initials: this.props.user.initials,
      attach: event.target.getAttribute("data-attach"),
      request: event.target.textContent
    };

    this.setState({ disabled: true });

    post("approve", data, pending => {
      store.dispatch(Actions.postServer({ pending }))
      this.setState({ disabled: false });
    })
  }
};

export default connect(mapStateToProps)(Shepherd)