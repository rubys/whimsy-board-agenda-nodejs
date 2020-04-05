import React from "react";

//
// Bootstrap modal dialogs are great, but they require a lot of boilerplate.
// This component provides the boiler plate so that other form components
// don't have to.  The elements provided by the calling component are
// distributed to header, body, and footer sections.
//
class ModalDialog extends React.Component {
  collateChildren() {
    let sections = {header: [], body: [], footer: []};

    React.Children.forEach(this.children, child => {
      if (child.tag === "h4") {
        // place h4 elements into the header, adding a modal-title class
        child = this.addClass(child, "modal-title");
        sections.header.push(child)
      } else if (child.tag === "button") {
        // place button elements into the footer, adding a btn class
        child = this.addClass(child, "btn");
        sections.footer.push(child)
      } else if (child.tag === "input" || child.tag === "textarea") {
        // wrap input and textarea elements in a form-control, 
        // add label if present
        child = this.addClass(child, "form-control");
        let label = null;

        if (child.data.attrs.label && child.data.attrs.id) {
          let props = {attrs: {for: child.data.attrs.id}};

          if (child.data.attrs.type === "checkbox") {
            props.class = ["checkbox"];

            label = React.createElement(
              "label",
              props,
              [child, React.createElement("span", child.data.attrs.label)]
            );

            delete child.data.attrs.label;
            child = null
          } else {
            label = React.createElement("label", props, child.data.attrs.label);
            delete child.data.attrs.label
          }
        };

        sections.body.push(React.createElement(
          "div",
          {class: "form-group"},
          [label, child]
        ))
      } else {
        // place all other elements into the body
        sections.body.push(child)
      }
    });

    return sections
  };

  render() {
    let sections = this.collateChildren();

    return <>
      <div className={"fade modal " + this.props.className} id={this.props.id}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className={"modal-header " + this.props.color}>
              <button className="close" type="button" data_dismiss="modal">×</button>
              {sections.header}
            </div>

            <div className="modal-body">{sections.body}</div>
            <div className={"modal-footer " + this.props.color}>{sections.footer}</div>
          </div>
        </div>
      </div>
    </>
  };

  // helper method: add a class to an element, returning new element
  addClass(element, name) {
    element.data = element.data || {};

    if (!element.data.class) {
      element.data.class = [name]
    } else if (!element.data.class.includes(name)) {
      element.data.class.push(name)
    };

    return element
  }
};

export default ModalDialog