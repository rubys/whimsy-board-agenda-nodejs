import Agenda from "../models/agenda.js";
import Pending from "../models/pending.js";
import React from "react";
import { Server } from "../utils.js";

//
// A button that will toggle offline status
//
class Offline extends React.Component {
  state = {disabled: false};

  render() {
    return <>{Server.offline ? <button className="btn-primary btn" onClick={this.click} disabled={this.state.disabled}>go online</button> : <button className="btn-primary btn" onClick={this.click} disabled={this.state.disabled}>go offline</button>}</>
  };

  click = event => {
    if (Server.offline) {
      this.setState({disabled: true});

      Pending.dbget((pending) => {
        // construct arguments to fetch
        let args = {
          method: "post",
          credentials: "include",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({agenda: Agenda.file, pending})
        };

        fetch("../json/batch", args).then((response) => {
          if (response.ok) {
            Pending.dbput({});
            response.json().then(pending => Server.pending = pending);
            Pending.setOffline(false)
          } else {
            response.text().then((text) => {
              alert(`Server error: ${response.status}`);
              console.log(text)
            })
          };

          this.setState({disabled: false})
        }).catch((error) => {
          alert(error);
          this.setState({disabled: false})
        })
      })
    } else {
      Pending.setOffline(true)
    }
  }
};

export default Offline