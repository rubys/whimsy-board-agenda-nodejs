import React from "react";

//
// Bootstrap modal dialogs are great, but they require a lot of boilerplate.
// This component provides the boiler plate so that other form components
// don't have to.  The elements provided by the calling component are
// distributed to header, body, and footer sections.
//
export default class ModalDialog extends React.Component {
  state = {header: [], body: [], footer: []};

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  };

  componentWillReceiveProps($$props) {
    this.state.header.length = 0;
    this.state.body.length = 0;
    this.state.footer.length = 0;

    for (let child of React.Children.toArray($$props.children)) {
      if (child.type == "h4") {
        // place h4 elements into the header, adding a modal-title class
        child = this.addClass(child, "modal-title");
        this.state.header.push(child);
        ModalDialog.h4 = child
      } else if (child.type == "button") {
        // place button elements into the footer, adding a btn class
        child = this.addClass(child, "btn");
        this.state.footer.push(child)
      } else if (child.type == "input" || child.type == "textarea") {
        // wrap input and textarea elements in a form-control, 
        // add label if present
        child = this.addClass(child, "form-control");
        let label = null;

        if (child.props.label && child.props.id) {
          let props = {htmlFor: child.props.id};

          if (child.props.type == "checkbox") {
            props.className = "checkbox";
            label = React.createElement("label", props, child, child.props.label);
            delete child.props.label;
            child = null
          } else {
            label = React.createElement("label", props, child.props.label);
            child = React.cloneElement(child, {label: null})
          }
        };

        this.state.body.push(React.createElement(
          "div",
          {className: "form-group"},
          label,
          child
        ))
      } else {
        // place all other elements into the body
        this.state.body.push(child)
      }
    }
  };

  render() {
    return <div className={"fade modal " + this.props.className} id={this.props.id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className={"modal-header " + this.props.color}>
            <button className="close" type="button" data_dismiss="modal">×</button>
            {this.state.header}
          </div>

          <div className="modal-body">{this.state.body}</div>
          <div className={"modal-footer " + this.props.color}>{this.state.footer}</div>
        </div>
      </div>
    </div>
  };

  // helper method: add a class to an element, returning new element
  addClass(element, name) {
    if (!element.props.className) {
      element = React.cloneElement(element, {className: name})
    } else if (!element.props.className.split(" ").includes(name)) {
      element = React.cloneElement(
        element,
        {className: element.props.className + ` ${name}`}
      )
    };

    return element
  }
}
