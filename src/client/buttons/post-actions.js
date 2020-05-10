import Agenda from "../models/agenda.js";
import EventBus from "../event-bus.js";
import React from "react";
import { post } from "../utils.js";
import Store from '../store.js';
import * as Actions from "../../actions.js";

//
// Post Action items
//
class PostActions extends React.Component {
  state = {disabled: false, list: []};

  render() {
    return <button className="btn-primary btn" onClick={this.click} disabled={this.state.disabled || this.state.list.length === 0}>post actions</button>
  };

  mounted() {
    EventBus.on("potential_actions", this.potential_actions)
  };

  beforeDestroy() {
    EventBus.off("potential_actions", this.potential_actions)
  };

  potential_actions(list) {
    this.setState({list: list})
  };

  click = event => {
    let data = {
      agenda: Agenda.file,
      message: "Post Action Items",
      actions: this.state.list
    };

    this.setState({disabled: true});

    post("post-actions", data, (response) => {
      this.setState({disabled: false});
      Store.dispatch(Actions.postAgenda(response.agenda));
    })
  }
};

export default PostActions
