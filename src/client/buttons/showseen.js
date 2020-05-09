import Main from "../layout/main.js";
import React from "react";

//
// Show/hide seen items
//
class ShowSeen extends React.Component {
  state = {label: "show seen"};

  render() {
    return <button className="btn-primary btn" onClick={this.click}>{this.state.label}</button>
  };

  created() {
    this.changeLabel()
  };

  click = (event) => {
    Main.view.toggleseen();
    this.changeLabel()
  };

  changeLabel() {
    if (Main.view && !Main.view.showseen()) {
      this.setState({label: "hide seen"})
    } else {
      this.setState({label: "show seen"})
    }
  }
};

export default ShowSeen