import Agenda from "../models/agenda.js";
import Minutes from "../models/minutes.js";
import React from "react";
import { Server, post, retrieve } from "../utils.js";
import { jQuery } from 'jquery';
import Store from "../store.js";
import * as Actions from "../../actions.js";
import { connect } from 'react-redux'

//
// Secretary Roll Call update form
class RollCall extends React.Component {
  static lockFocus = false;

  state = {guest: ""};
  
  render() {
    let guest, found, minutes;

    let people = this.people;

    return <section className="flexbox">
      <section id="rollcall">
        <h3>Directors</h3>

        <ul>
          {people.map(person => person.role === "director" ? <Attendee person={person}/> : null)}
        </ul>

        <h3>Executive Officers</h3>

        <ul>
          {people.map(person => person.role === "officer" ? <Attendee person={person}/> : null)}
        </ul>

        <h3>Guests</h3>

        <ul>
          {people.map(person => person.role === "guest" ? <Attendee person={person}/> : null)}

          <li>
            <input className="walkon" value={this.state.guest} disabled={this.state.disabled} onFocus={() => (
              RollCall.lockFocus = true
            )} onBlur={() => RollCall.lockFocus = false}/>
          </li>

          {this.state.guest.length >= 3 ? <>
            {guest = this.state.guest.toLowerCase().split(" ")}
            {found = false}

            {Server.committers.map((person) => {
              if (guest.every(part => (
                person.id.includes(part) || person.name.toLowerCase().includes(part)
              )) && !this.people.some(registered => registered.id === person.id)) {
                found = true;
                return <Attendee person={person} walkon={true}/>;
              } else {
                return null
              }
            })}

            {!found ? <Attendee person={{name: this.state.guest}} walkon={true}/> : null}
          </> : null}
        </ul>
      </section>

      <section>
        {minutes = Minutes.get(this.props.item.title)}

        {minutes ? <>
          <h3>Minutes</h3>
          <pre className="comment">{minutes}</pre>
        </> : null}
      </section>
    </section>
  };

  // collect a sorted list of people
  get people() {
    let list = [];

    // start with those listed in the agenda
    for (let [id, person] of Object.entries(this.props.item.people)) {
      person.id = id;
      list.push(person)
    };

    // add remaining attendees
    let attendees = Minutes.attendees;

    if (attendees) {
      for (let [name, attendee] of Object.entries(attendees)) {
        if (!list.some(person => person.name === name)) {
          let person = attendee;
          person.name = name;
          person.role = "guest";
          list.push(person)
        }
      }
    };

    return list.sort((person1, person2) => (
      person1.sortName > person2.sortName ? 1 : -1
    ))
  };

  // clear guest
  clear_guest() {
    this.setState({guest: ""})
  };

  // client side initialization on first rendering
  mounted() {
    if (Server.committers) {
      this.setState({disabled: false})
    } else {
      this.setState({disabled: true});

      retrieve("committers", "json", (committers) => {
        Server.committers = committers || [];
        this.setState({disabled: false})
      })
    };

    // export clear method
    RollCall.clear_guest = this.clear_guest
  };

  // scroll walkon input field towards the center of the screen
  updated() {
    if (RollCall.lockFocus && this.state.guest.length >= 3) {
      let walkon = document.getElementsByClassName("walkon")[0];
      let offset = walkon.offsetTop + walkon.offsetHeight / 2 - window.innerHeight / 2;
      jQuery("html, body").animate({scrollTop: offset}, "slow")
    }
  }
};

//
// An individual attendee (Director, Executive Officer, or Guest)
//
class Attendee extends React.Component {
  state = {base: ""};

  created() {
    return this.setState({base: this.status.notes})
  };

  // create a version of notes without the leading dash
  get notes() {
    return this.status.notes ? this.status.notes.replace(" - ", "") : ""
  };

  set notes(value) {
    if (value) {
      this.status.notes = ` - ${value}`
    } else {
      this.status.notes = null
    }
  };

  // perform initialization on first rendering
  get status() {
    if (this.props.clock_counter > 0) return this.state.saved_status;
    return this.setState({saved_status: Minutes.attendees[this.props.person.name] || {}})
  };

  // render a checkbox, a hypertexted link of the attendee's name to the
  // roster page for the committer, and notes in both editable and non-editable
  // forms.  CSS controls which version of the notes is actually displayed.
  render() {
    let roster;
    
    return <li onMouseOver={this.focus}>
      <input type={"checkbox"} checked={this.status.present} onClick={this.click}/>
      {roster = "/roster/committer/"}
      {this.props.person.id ? <a href={`${roster}${this.props.person.id}`} style={{fontWeight: this.props.person.member ? "bold" : "normal"}}>{this.props.person.name}</a> : <a className="hilite" href={`${roster}?q=${this.props.person.name}`}>{this.props.person.name}</a>}
      {!this.props.walkon && !this.status.present && this.props.person.role !== "guest" && !this.props.person.attending ? !this.status.notes ? <span> (expected to be absent)</span> : null : null}

      {!this.props.walkon ? <>
        <label/>
        <input type="text" value={this.notes} onBlur={this.blur} disabled={this.state.disabled}/>
        <span>{this.status.notes}</span>
      </> : null}
    </li>
  };

  // when moving cursor over a list item, focus on the input field
  focus(event) {
    if (!RollCall.lockFocus) {
      event.target.parentNode.querySelector("input[type=text]").focus()
    }
  };

  // when checkbox is clicked, post update
  click(event) {
    this.status.present = event.target.checked;
    this.post_update()
  };

  // when leaving a list item, post update if value changed
  blur() {
    if (this.state.base !== this.status.notes) {
      this.setState({base: this.status.notes});
      this.post_update()
    }
  };

  // send updates to the server
  post_update() {
    let data = {
      agenda: Agenda.file,
      action: "attendance",
      name: this.props.person.name,
      id: this.props.person.id,
      present: this.status.present,
      notes: this.notes
    };

    this.setState({disabled: true});
    Store.dispatch(Actions.clockIncrement());

    post("minute", data, (minutes) => {
      Store.dispatch(Actions.clockDecrement());;
      Minutes.load(minutes);
      if (this.props.walkon) RollCall.clear_guest();
      this.setState({disabled: false})
    })
  }
};

function mapStateToProps(state) {
  return { clock_counter: state.clock_counter }
};

export default connect(mapStateToProps)(RollCall)
