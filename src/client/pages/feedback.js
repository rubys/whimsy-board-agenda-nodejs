import { navigate } from "../router.js";
import EventBus from "../event-bus.js";
import React from "react";

//
// Select and send item comments as feedback.
//
class Feedback extends React.Component {
  static buttons() {
    return [{ button: SendFeedback }]
  };

  state = { list: null };

  render() {
    return <>{this.state.list === null ? <h2>Loading...</h2>
      : this.state.list.length === 0 ? <h2>No feedback to send</h2>
        : this.state.list.map(item => <>
          <h2>
            <input type="checkbox" domPropsChecked={item.checked} onClick={() => (
              item.checked = !item.checked
            )} />

            {item.title}
          </h2>

          <pre className="feedback">{item.mail}</pre>
        </>
        )}</>
  };

  mounted() {
    EventBus.on("potential_feedback", this.potential_feedback);

    fetch("feedback.json", { credentials: "include" }).then(response => (
      response.json().then((json) => {
        // initially check each item which has not yet been sent
        for (let item of json) {
          item.checked = !item.sent
        };

        EventBus.emit("potential_feedback", json)
      })
    ))
  };

  beforeDestroy() {
    EventBus.off("potential_feedback", this.potential_feedback)
  };

  potential_feedback(list) {
    this.setState({ list: list })
  }
};

//
// Send feedback button
//
class SendFeedback extends React.Component {
  state = { disabled: false, list: [] };

  render() {
    return <button className="btn-primary btn" onClick={this.click} disabled={this.state.disabled || this.state.list.length === 0 || this.state.list.every(item => (
      !item.checked
    ))}>send email</button>
  };

  mounted() {
    EventBus.on("potential_feedback", this.potential_feedback)
  };

  beforeDestroy() {
    EventBus.off("potential_feedback", this.potential_feedback)
  };

  potential_feedback(list) {
    this.setState({ list: list })
  };

  click(event) {
    let $list = this.state.list;

    // gather a list of checked items
    let checked = {};

    for (let item of $list) {
      if (item.checked) checked[item.title.replace(/\s/g, "_")] = true
    };

    // construct arguments to fetch
    let args = {
      method: "post",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked })
    };

    // send feedback
    this.setState({ disabled: true });

    fetch("feedback.json", args).then(response => (
      response.json().then((json) => {
        // check each item which still has yet to be sent
        for (let item of json) {
          item.checked = !item.sent
        };

        this.setState({ list: $list = json });
        EventBus.emit("potential_feedback", $list);
        this.setState({ disabled: false });

        // return to the Adjournment page
        navigate("/Adjournment")
      })
    ));

    this.setState({ list: $list })
  }
};

export default Feedback
