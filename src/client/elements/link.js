import Main from "../layout/main.js";
import React from "react";

//
// Replacement for 'a' element which handles clicks events that can be
// processed locally by calling Main.navigate.
//
class Link extends React.Component {
  render() {
    return React.createElement(
      this.element,
      this.options,
      this.props.text
    )
  };

  get element() {
    return this.props.href ? "a" : "span"
  };

  get options() {
    let result = {};

    if (this.props.href) {
      result.href = this.props.href.replace(
        /(^|\/)\w+\/\.\.(\/|$)/g,
        "$1"
      )
    };

    if (this.props.rel) result.rel = this.props.rel;
    if (this.props.id) result.id = this.props.id;
    result.onClick = this.click;
    return result
  };

  click = (event) => {
    if (event.ctrlKey || event.shiftKey || event.metaKey) return;
    let href = event.target.getAttribute("href");

    if (/^(\.|cache\/.*|(flagged\/|(shepherd\/)?(queue\/)?)[-\w]+)$/m.test(href)) {
      event.stopPropagation();
      event.preventDefault();
      Main.navigate(href);
      return false
    }
  }
};

export default Link