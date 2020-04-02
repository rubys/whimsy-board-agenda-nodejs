import Agenda from "../models/agenda.js";
import Link from "../elements/link.js";
import Main from "../layout/main.js";
import Minutes from "../models/minutes.js";
import React from "react";
import { post, retrieve } from "../utils.js";

//
// Secretary version of Adjournment section: shows todos
//
class Adjournment extends React.Component {
  state = {
    add: [],
    remove: [],
    change: [],
    terminate: [],
    establish: [],
    feedback: [],
    minutes: {},
    loading: true,
    fetched: false
  };

  // export self as shared state
  created() {
    if (typeof global !== 'undefined') {
      global.Todos = this
    } else {
      window.Todos = this
    }
  };

  // update state
  set(values) {
    for (let [attr, value] of Object.entries(values)) {
      window.Todos[attr] = value
    }
  };

  // find corresponding agenda item
  link(title) {
    let link = null;

    for (let item of Agenda.index) {
      if (item.title === title) link = item.href
    };

    return link
  };

  render() {
    const Todos = window.Todos;
    let completed = Todos.minutes.todos;
    let minutes = Minutes.get(this.props.item.title);

    return <section className="flexbox">
      <section>
        <pre className="report">{this.props.item.text}</pre>

        {!Todos.loading || Todos.fetched ? <>
          <h3>Post Meeting actions</h3>
          {Todos.add.length === 0 && Todos.remove.length === 0 && Todos.change.length === 0 && Todos.establish.length === 0 ? Todos.loading ? <em>Loading...</em> : <p className="comment">complete</p> : null}
        </> : null}

        {Todos.add.length !== 0 || Todos.change.length !== 0 || Todos.establish.length !== 0 ? <PMCActions /> : null}
        {Todos.remove.length !== 0 ? <TodoRemove /> : null}
        {Todos.feedback.length !== 0 ? <FeedbackReminder /> : null}

        {completed && Object.keys(completed).length > 0 && ((completed.added && completed.added.length !== 0) || (completed.changed && completed.changed.length !== 0) || (completed.removed && completed.removed.length !== 0) || (completed.established && completed.established.length !== 0) || (completed.feedback_sent && completed.feedback_sent.length !== 0)) ? <>
          <h3>Completed actions</h3>

          {completed.added && completed.added.length !== 0 ? <>
            <p>Added to PMC chairs</p>

            <ul>
              {completed.added.map(id =>
                <li>
                  <a href={`../../../roster/committer/${id}`}>{id}</a>
                </li>
              )}
            </ul>
          </> : null}

          {completed.changed && completed.changed.length !== 0 ? <>
            <p>Changed PMC chairs</p>

            <ul>
              {completed.changed.map(pmc =>
                <li>
                  <a href={`../../../roster/committee/${pmc}`}>{pmc}</a>
                </li>
              )}
            </ul>
          </> : null}

          {completed.removed && completed.removed.length !== 0 ? <>
            <p>Removed from PMC chairs</p>

            <ul>
              {completed.removed.map(id =>
                <li>
                  <a href={`../../../roster/committer/${id}`}>{id}</a>
                </li>
              )};
            </ul>
          </> : null}

          {completed.established && completed.established.length !== 0 ? <>
            <p>Established PMCs</p>

            <ul>
              {completed.established.map(pmc =>
                <li>
                  <a href={`../../../roster/committee/${pmc}`}>{pmc}</a>
                </li>
              )};
            </ul>
          </> : null}

          {completed.terminated && completed.terminated.length !== 0 ? <>
            <p>Terminated PMCs</p>

            <ul>
              {completed.terminated.map(pmc =>
                <li>
                  <a href={`../../../roster/committee/${pmc.toLowerCase()}`}>{pmc.toLowerCase()}</a>
                </li>
              )}
            </ul>
          </> : null}

          {completed.feedback_sent && completed.feedback_sent.length !== 0 ? <>
            <p>Sent feedback</p>

            <ul>
              {completed.feedback_sent.map(pmc =>
                <li>
                  <Link text={pmc} href={pmc.replace(/\s+/g, "-")} />
                </li>
              )};
            </ul>
          </> : null}
        </> : null}
      </section>

      <section>
        {minutes ? <>
          <h3>Minutes</h3>
          <pre className="comment">{minutes}</pre>
        </> : null}
      </section>
    </section>
  };

  // fetch secretary todos once the minutes are complete
  load() {
    const Todos = window.Todos;

    if (Minutes.complete && !Todos.fetched) {
      Todos.loading = true;
      Todos.fetched = true;

      retrieve(`secretary-todos/${Agenda.title}`, "json", (todos) => {
        Todos.set(todos);
        Todos.loading = false
      })
    }
  };

  mounted() {
    if (window.Todos.loading) this.load()
  }
};

class PMCActions extends React.Component {
  state = { resolutions: [] };

  render() {
    return <>
      <p>
        <a href="https://infra.apache.org/officers/tlpreq">PMC resolutions:</a>
      </p>

      <ul className="checklist">
        {this.state.resolutions.map(item =>
          <li>
            <input type="checkbox" checked={item.checked} onClick={() => {
              item.checked = !item.checked;
              this.refresh()
            }} />

            <Link text={item.title} href={window.Todos.link(item.title)} />

            {item.minutes ? <>
              -
            <Link text={item.minutes} href={window.Todos.link(item.title)} />
            </> : null}
          </li>
        )}
      </ul>

      <button className="btn-default btn checklist" disabled={this.state.disabled} onClick={this.submit}>Submit</button>
    </>
  };

  // gather a list of resolutions
  created() {
    let $resolutions = [];

    for (let item of Agenda.index) {

      for (let todo_type of ["change", "establish", "terminate"]) {
        for (let todo of window.Todos[todo_type]) {
          if (todo.resolution === item.title) {
            let minutes = Minutes.get(item.title);

            let resolution = {
              action: todo_type,
              name: todo.name,

              display_name: item.title.replace(
                new RegExp(`^${todo_type} `, "im"),
                ""
              ).replace(/ Chair$/im, ""),

              title: item.title,
              minutes,
              checked: !minutes.includes("tabled")
            };

            if (todo.chair) resolution.chair = todo.chair;
            if (todo.people) resolution.people = todo.people;
            $resolutions.push(resolution)
          }
        }
      }
    };

    this.refresh();
    this.setState({ resolutions: $resolutions })
  };

  refresh() {
    this.setState({ disabled: this.state.resolutions.every(item => !item.checked) })
  };

  submit() {
    let data = { change: [], establish: [], terminate: [] };

    for (let resolution of this.state.resolutions) {
      if (resolution.checked) data[resolution.action].push(resolution)
    };

    if (data.change.length === 0) data.change = null;
    if (data.establish.length === 0) data.establish = null;
    if (data.terminate.length === 0) data.terminate = null;
    this.setState({ disabled: true });

    post(`secretary-todos/${Agenda.title}`, data, (todos) => {
      this.setState({ disabled: false });
      window.Todos.set(todos)
    })
  }
};

//#######################################################################
//                            Remove chairs                             #
//#######################################################################
class TodoRemove extends React.Component {
  state = { checked: {}, disabled: false };

  // update check marks based on current Todo list
  created() {
    for (let person of window.Todos.remove) {
      if (this.state.checked[person.id] === undefined) {
        if (!person.resolution || Minutes.get(person.resolution) !== "tabled") {
          this.setState('checked', {...this.state.checked, [person.id]: true})
        }
      }
    }
  };

  render() {
    let people = window.Todos.remove;

    return <>
      <p>Remove from pmc-chairs:</p>

      <ul className="checklist">
        {people.map(person =>
          <li>
            <input type="checkbox" checked={this.state.checked[person.id]} onClick={() => (
              this.setState('checked', {...this.state.checked, [person.id]: !this.state.checked[person.id]})
            )} />

            <a href={`/roster/committer/${person.id}`}>{person.id}</a>
            {` (${person.name})`}
          </li>
        )}
      </ul>

      <button className="btn-default btn checklist" onClick={this.submit} disabled={this.state.disabled || people.length === 0 || !people.some(person => (
        this.state.checked[person.id]
      ))}>Submit</button>
    </>
  };

  submit() {
    this.setState({ disabled: true });
    let remove = [];

    for (let [id, checked] of Object.entries(this.state.checked)) {
      if (checked) remove.push(id)
    };

    post(`secretary-todos/${Agenda.title}`, { remove }, (todos) => {
      this.setState({ disabled: false });
      window.Todos.set(todos);

      // uncheck people who were removed
      for (let id in this.state.checked) {
        if (!window.Todos.remove.some(person => person.id === id)) {
          this.setState('checked', {...this.state.checked, [id]: false})
        }
      }
    })
  }
};

//#######################################################################
//                      Reminder to draft feedback                      #
//#######################################################################
class FeedbackReminder extends React.Component {
  render() {
    return <>
      <p>Draft feedback:</p>

      <ul className="row list-group">
        {window.Todos.feedback.map(pmc =>
          <li className="col-lg-2 col-md-3 col-sm-4 col-xs-6 list-group-item">
            <Link text={pmc} href={pmc.replace(/\s+/g, "-")} />
          </li>
        )}
      </ul>

      <button className="btn-default btn checklist" onClick={() => (
        Main.navigate("feedback")
      )}>Submit</button>
    </>
  }
};

export default Adjournment