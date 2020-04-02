import EventBus from "../event-bus.js";
import PostActions from "../buttons/post-actions.js";
import React from "react";
import Text from "../elements/text.js";
import { retrieve, hotlink } from "../utils.js";

//
// Action items.  Link to PMC reports when possible, highlight missing
// action item status updates.
//
class SelectActions extends React.Component {
  static buttons() {
    return [{button: PostActions}]
  };

  state = {list: [], names: []};

  render() {
    return <>
      <h3>Post Action Items</h3>
      <p className="alert-info">{"Action Items have yet to be posted. Unselect the ones below that have been completed. Click on the \"post actions\" button when done."}</p>

      <pre className="report">{this.state.list.map(action => (
        <CandidateAction action={action} names={this.state.names}/>
      ))}</pre>
    </>
  };

  mounted() {
    retrieve("potential-actions", "json", (response) => {
      if (response) {
        let $list = response.actions;

        this.setState({
          list: $list,
          names: response.names
        });

        EventBus.emit("potential_actions", $list)
      }
    });
  }
};

export class CandidateAction extends React.Component {
  render() {
    return <>
      <input type="checkbox" checked={!this.props.action.complete} onClick={() => (
        this.props.action.complete = !this.props.action.complete
      )}/>

      <span> </span>
      <span>{this.props.action.owner}</span>
      <span>: </span>
      <span>{this.props.action.text}</span>
      <span>{`\n      [ ${this.props.action.pmc} ${this.props.action.date} ]\n      `}</span>
      {this.props.action.status ? <Text raw={`Status: ${this.props.action.status}\n`} filters={[hotlink]}/> : null}
      <span>
      </span>
    </>
  }
};

export default SelectActions
