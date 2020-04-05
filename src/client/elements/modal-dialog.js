import React from "react";

//
// Bootstrap modal dialogs are great, but they require a lot of boilerplate.
// This component provides the boiler plate so that other form components
// don't have to.  The elements provided by the calling component are
// distributed to header, body, and footer sections.
//
class ModalDialog extends React.Component {
  collateSlots() {
    let sections = {header: [], body: [], footer: []};

    React.Children.forEach(this.children, slot => {
      if (slot.tag === "h4") {
        // place h4 elements into the header, adding a modal-title class
        slot = this.addClass(slot, "modal-title");
        sections.header.push(slot)
      } else if (slot.tag === "button") {
        // place button elements into the footer, adding a btn class
        slot = this.addClass(slot, "btn");
        sections.footer.push(slot)
      } else if (slot.tag === "input" || slot.tag === "textarea") {
        // wrap input and textarea elements in a form-control, 
        // add label if present
        slot = this.addClass(slot, "form-control");
        let label = null;

        if (slot.data.attrs.label && slot.data.attrs.id) {
          let props = {attrs: {for: slot.data.attrs.id}};

          if (slot.data.attrs.type === "checkbox") {
            props.class = ["checkbox"];

            label = React.createElement(
              "label",
              props,
              [slot, React.createElement("span", slot.data.attrs.label)]
            );

            delete slot.data.attrs.label;
            slot = null
          } else {
            label = React.createElement("label", props, slot.data.attrs.label);
            delete slot.data.attrs.label
          }
        };

        sections.body.push(React.createElement(
          "div",
          {class: "form-group"},
          [label, slot]
        ))
      } else {
        // place all other elements into the body
        sections.body.push(slot)
      }
    });

    return sections
  };

  render() {
    let sections = this.collateSlots();

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