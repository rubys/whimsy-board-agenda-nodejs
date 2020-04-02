import React from "react";
import { htmlEscape } from "../utils.js";

//
// Escape text for inclusion in HTML; optionally apply filters
//
class Text extends React.Component {
  render() {
    return <span domPropsInnerHTML={this.text}/>
  };

  text() {
    let result = htmlEscape(this.props.raw || "");

    if (this.props.filters) {
      for (let filter of this.props.filters) {
        result = filter(result)
      }
    };

    return result
  }
};

export default Text