import Agenda from "../models/agenda.js";
import Link from "../elements/link.js";
import Minutes from "../models/minutes.js";
import React from "react";
import User from "../models/user.js";

//
// Layout footer consisting of a previous link, any number of buttons,
// followed by a next link.
//
// Overrides previous and next links when traversal is queue, shepherd, or
// Flagged.  Injects the flagged items into the flow on the meeting day
// (last executive officer <-> first flagged/unapproved/missing &&
//  last flagged/unapproved/missing <-> first Special order)
//
class Footer extends React.Component {
  state = { meeting_day: Minutes.started || Agenda.meeting_day };

  render() {
    return <footer className={"navbar-fixed-bottom navbar " + this.props.item.color}>
      <PrevLink item={this.props.item} />

      <span>{this.props.buttons ? this.props.buttons.map((button) => {
        let props;

        if (button.text) {
          props = { attrs: button.attrs };

          if (button.attrs.class) {
            props.class = button.attrs.class.split(" ");
            delete button.attrs.class
          };

          return React.createElement("button", props, button.text)
        } else if (button.type) {
          return React.createElement(button.type, { props: button.attrs })
        }

        return null
      }) : null}</span>

      <NextLink item={this.props.item} />
    </footer>
  }
};

/* eslint-disable jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content */

class PrevLink extends React.Component {
  render() {
    let link = this.props.item.prev;
    let prefix = "";

    if (this.props.options.traversal === "queue") {
      prefix = "queue/";

      while (link && !link.ready_for_review(User.initials)) {
        link = link.prev
      };

      link = link || { href: "../queue", title: "Queue" }
    } else if (this.props.options.traversal === "shepherd") {
      prefix = "shepherd/queue/";

      while (link && link.shepherd !== this.props.item.shepherd) {
        link = link.prev
      };

      link = link || {
        href: `../${this.props.item.shepherd}`,
        title: "Shepherd"
      }
    } else if (this.props.options.traversal === "flagged") {
      prefix = "flagged/";

      while (link && link.skippable) {
        if (/^\d[A-Z]/m.test(link.attach)) {
          prefix = "";
          break
        } else {
          link = link.prev
        }
      };

      if (!link) {
        if (this.state.meeting_day) {
          link = Agenda.index.find(item => item.next && /^\d+$/m.test(item.next.attach));
          prefix = ""
        };

        link = link || { href: "flagged", title: "Flagged" }
      }
    } else if (this.state.meeting_day && /\d/.test(this.props.item.attach) && link && /^[A-Z]/m.test(link.attach)) {
      for (let item of Agenda.index) {
        if (!item.skippable && /^([A-Z]|\d+$)/m.test(item.attach)) {
          prefix = "flagged/";
          link = item
        }
      }
    };

    if (link) {
      return <Link className={"navbar-brand backlink " + link.color} text={link.title} rel="prev" href={`${prefix}${link.href}`} />
    } else if (this.props.item.prev || this.props.item.next) {
      return <a className="navbar-brand" />
    } else {
      return null
    }
  }
}

class NextLink extends React.Component {
  render() {
    let link = this.props.item.next;
    let prefix = '';

    if (this.props.options.traversal === "queue") {
      while (link && !link.ready_for_review(User.initials)) {
        link = link.next
      };

      link = link || { href: "queue", title: "Queue" }
    } else if (this.props.options.traversal === "shepherd") {
      while (link && link.shepherd !== this.props.item.shepherd) {
        link = link.next
      };

      link = link || {
        href: `shepherd/${this.props.item.shepherd}`,
        title: "shepherd"
      }
    } else if (this.props.options.traversal === "flagged") {
      prefix = "flagged/";

      while (link && link.skippable) {
        if (this.state.meeting_day && !/^(\d+|[A-Z]+)$/m.test(link.attach)) {
          prefix = "";
          break
        } else {
          link = link.next
        }
      };

      link = link || { href: "flagged", title: "Flagged" }
    } else if (this.state.meeting_day && link && /^\d[A-Z]/m.test(this.props.item.attach) && /^\d/m.test(link.attach)) {
      while (link && link.skippable && /^([A-Z]|\d+$)/m.test(link.attach)) {
        link = link.next
      };

      prefix = "flagged/"
    };

    if (link) {
      return <Link className={"navbar-brand nextlink " + link.color} text={link.title} rel="next" href={`${prefix}${link.href}`} />
    } else if (this.props.item.prev || this.props.item.next) {
      return <a className="navbar-brand" />
    } else {
      return null
    }
  }
}

export default Footer