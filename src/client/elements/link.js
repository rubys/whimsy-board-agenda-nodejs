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

  element() {
    return this.props.href ? "a" : "span"
  };

  options() {
    let result = {attrs: {}};

    if (this.props.href) {
      result.attrs.href = this.props.href.replace(
        /(^|\/)\w+\/\.\.(\/|$)/g,
        "$1"
      )
    };

    if (this.props.rel) result.attrs.rel = this.props.rel;
    if (this.props.id) result.attrs.id = this.props.id;
    result.on = {click: this.click};
    return result
  };

  click(event) {
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