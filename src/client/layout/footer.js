import Agenda from "../models/agenda.js";
import Minutes from "../models/minutes.js";
import React from "react";
import User from "../models/user.js";
import { Link } from "react-router-dom";

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
  render() {
    return <footer className={"fixed-bottom navbar " + this.props.item.color}>
      <PrevLink item={this.props.item} options={this.props.options} />

      <span>{this.props.buttons ? this.props.buttons.map((button) => {
        let props;

        if (button.text) {
          props = { ...button.attrs, key: button.text };

          if (button.attrs.class) {
            props.className = button.attrs.class.split(" ");
            delete props.class;
          };

          return React.createElement("button", props, button.text)
        } else if (button.type) {
          return React.createElement(button.type, { ...button.attrs, key: button.type.name })
        }

        return null
      }) : null}</span>

      <NextLink item={this.props.item} options={this.props.options} />
    </footer>
  }
};

/* eslint-disable jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content */

class PrevLink extends React.Component {
  render() {
    let link = this.props.item.prev;
    let prefix = "";
    let meetingDay = Minutes.started || Agenda.meeting_day;

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
        if (meetingDay) {
          link = Agenda.index.find(item => item.next && /^\d+$/m.test(item.next.attach));
          prefix = ""
        };

        link = link || { href: "flagged", title: "Flagged" }
      }
    } else if (meetingDay && /\d/.test(this.props.item.attach) && link && /^[A-Z]/m.test(link.attach)) {
      for (let item of Agenda.index) {
        if (!item.skippable && /^([A-Z]|\d+$)/m.test(item.attach)) {
          prefix = "flagged/";
          link = item
        }
      }
    };

    if (link) {
      return <Link className={"navbar-brand backlink " + link.color} rel="prev" to={`${prefix}${link.href}`}>{link.title}</Link>
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
    let meetingDay = Minutes.started || Agenda.meeting_day;

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
        if (meetingDay && !/^(\d+|[A-Z]+)$/m.test(link.attach)) {
          prefix = "";
          break
        } else {
          link = link.next
        }
      };

      link = link || { href: "flagged", title: "Flagged" }
    } else if (meetingDay && link && /^\d[A-Z]/m.test(this.props.item.attach) && /^\d/m.test(link.attach)) {
      while (link && link.skippable && /^([A-Z]|\d+$)/m.test(link.attach)) {
        link = link.next
      };

      prefix = "flagged/"
    };

    if (link) {
      return <Link className={"navbar-brand nextlink " + link.color} rel="next" to={`${prefix}${link.href}`}>{link.title}</Link>
    } else if (this.props.item.prev || this.props.item.next) {
      return <a className="navbar-brand" />
    } else {
      return null
    }
  }
}

export default Footer