import Agenda from "./models/agenda.js";
import Adjournment from "./pages/adjournment.js";
import Backchannel from "./pages/backchannel.js";
import BootStrapPage from "./pages/bootstrap.js";
import CacheStatus, { CachePage } from "./pages/cache.js";
import Comments from "./pages/comments.js";
import DraftMinutes from "./buttons/draft-minutes.js";
import Feedback from "./pages/feedback.js";
import Flagged from "./pages/flagged.js";
import Help from "./pages/help.js";
import Index from "./pages/index.js";
import InsiderSecrets from "./pages/secrets.js";
import Install from "./buttons/install.js";
import Main from "./layout/main.js";
import Minutes from "./models/minutes.js";
import Missing from "./pages/missing.js";
import PageCache from "./models/pagecache.js";
import Queue from "./pages/queue.js";
import Post from "./buttons/post.js";
import PublishMinutes from "./buttons/publish-minutes.js";
import React from "react";
import Refresh from "./buttons/refresh.js";
import Rejected from "./pages/rejected.js";
import RollCall from "./pages/roll-call.js";
import Search from "./pages/search.js";
import Server from "./pages/server.js";
import Summary from "./buttons/summary.js";
import Shepherd from "./pages/shepherd.js";
import Store from "./pages/store.js";
import User from "./models/user.js";
import * as Utils from "./utils.js";
import { InitialReminder, FinalReminder, ProdReminder } from "./buttons/reminders.js";
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from "react-router-dom";
import Report from "./pages/report.js";

//
// Route request based on path and query information in the URL
//
// Additionally provides defaults for color and title, and 
// determines what buttons are required.
//

let history = null;

export function navigate(path, query) {
  history.push(path, { path, query });
}

function mapStateToProps(state) {
  return {
    agenda: state.agenda,
    agendas: state.server.agendas || {},
    meetingDate: state.client.meetingDate,
    role: state.server?.user?.role
  }
};

class Router extends React.Component {

  state = {};

  static getDerivedStateFromProps(props) {
    history = props.history;

    let path = props.location.pathname;

    // store initial state in history
    if (!props.location.state) {
      if (path === "/bootstrap.html") {
        path = document.location.href;
        let base = document.getElementsByTagName("base")[0].href;

        if (path.startsWith(base)) {
          path = path.slice(base.length)
        } else if (path.endsWith("/latest/")) {
          Main.latest = true;
          path = "."
        }
      };

      props.history.replace(path, { path });
    };

    Agenda.load(props.agenda);

    return {}
  }

  // helper to construct a call to <Main> with the proper buttons and options
  main = (item, options = {}) => {
    // bail unless an item was found
    if (!item) return <Main />;

    // provide defaults for required properties
    item.color = item.color || "blank";

    // if title is not present, construct a title from the class name
    if (!item.title) {
      let view = item.view;
      if (view.WrappedComponent) view = view.WrappedComponent;
      item.title = view.name.replace(
        /(^|-)\w/g,
        c => c.toUpperCase()
      ).replace(/-/g, " ").trim()
    };

    // determine what buttons are required, merging defaults, form provided
    // overrides, and any overrides provided by the agenda item itself
    let buttons = item.buttons || [];
    if (item.view.buttons) buttons = [...item.view.buttons(), ...buttons];

    if (buttons) {
      buttons = buttons.map((button) => {
        let props = {
          text: "button",
          attrs: { className: "btn" },
          form: button.form
        };

        // form overrides
        let form = button.form;

        if (form && form.button) {
          for (let [name, override] of Object.entries(form.button)) {
            if (name === "text") {
              props.text = form.button.text
            } else if (name === "class" || name === "className") {
              props.attrs.className += ` ${override.replace(/_/g, "-")}`
            } else {
              props.attrs[name.replace(/_/g, "-")] = override
            }
          }
        } else {
          // no form or form has no separate button: so this is just a button
          delete props.text;
          props.type = button.button || form;
          props.attrs = { item, server: Utils.Server }
        };

        // item overrides
        for (let [name, override] of Object.entries(button)) {
          if (name === "text") {
            props.text = button.text
          } else if (name === "class" || name === "className") {
            props.attrs.className += ` ${override.replace(/_/g, "-")}`
          } else if (name !== "form") {
            props.attrs[name.replace(/_/g, "-")] = override
          }
        };

        // clear modals
        if (typeof document !== 'undefined') {
          document.body.classList.remove("modal-open")
        };

        return props
      })
    };

    let props = { ...item, buttons, options };

    return <Main {...props} />
  }

  render() {
    let main = this.main;

    if (!this.props.agenda?.length) return main(null);

    // route request based on path and query from the window location (URL)
    return <Switch>

      <Route exact path={['/', '/.']}>
        {() => {
          let prev = { title: "Help", href: "help" };
          let next = prev;

          for (let agenda of this.props.agendas) {
            let date = (agenda.match(/(\d+_\d+_\d+)/) || [])[1].replace(/_/g, "-");

            if (date < this.props.meetingDate && (prev.title === "Help" || date > prev.title)) {
              prev = { title: date, href: `../${date}/` }
            } else if (date > this.props.meetingDate && (next.title === "Help" || date < next.title)) {
              next = { title: date, href: `../${date}/` }
            }
          };

          let buttons = [{ button: Refresh }];

          if (!Minutes.complete) {
            buttons.push({ form: Post, text: "add item" })
          } else if (["director", "secretary"].includes(this.props.role)) {
            if (!Minutes.summary_sent) buttons.push({ form: Summary })
          };

          if (this.props.role === "secretary") {
            if (Agenda.approved === "approved") {
              buttons.push({ form: PublishMinutes })
            } else if (Minutes.ready_to_post_draft) {
              buttons.push({ form: DraftMinutes })
            }
          };

          return main({ view: Index, title: this.props.meetingDate, buttons, prev, next })
        }}
      </Route>

      <Route exact path="/search">
        {({ history: { location: { search } } }) => (
          main({ view: Search, query: search })
        )}
      </Route>

      <Route exact path="/comments">
        {main({ view: Comments })}
      </Route>

      <Route exact path="/backchannel">
        {main({
          view: Backchannel,
          title: "Agenda Backchannel",
          online: Server.online
        })}
      </Route>

      <Route exact path="/queue">
        {() => {
          let item = { view: Queue, title: "Queued approvals and comments" };
          if (User.role !== "director") item.title = "Queued comments";
          return main(item)
        }}
      </Route>

      <Route exact path="/flagged">
        {main({ view: Flagged, title: "Flagged reports" })}
      </Route>

      <Route exact path="/rejected">
        {main({ view: Rejected, title: "Reports which were NOT accepted" })}
      </Route>

      <Route exact path="/missing">
        {() => {
          let buttons = [{ form: InitialReminder }, { button: FinalReminder }];

          if (Agenda.index.some(item => item.nonresponsive)) {
            buttons.push({ form: ProdReminder })
          };

          return main({ view: Missing, title: "Missing reports", buttons })
        }}
      </Route>

      <Route path="/flagged/:path">
        {({ match: { params: { path } } }) => (
          main(this.find(path), { traversal: "flagged" })
        )}
      </Route>

      <Route path="/queue/:path">
        {({ match: { params: { path } } }) => (
          main(this.find(path), { traversal: "queue" })
        )}
      </Route>

      <Route path="/shepherd/queue/:path">
        {({ match: { params: { path } } }) => (
          main(this.find(path), { traversal: "shepherd" })
        )}
      </Route>

      <Route path="/shepherd/:shepherd">
        {({ match: { params: { shepherd } } }) => {
          let item = {
            view: Shepherd,
            shepherd,
            next: null,
            prev: null,
            title: `Shepherded by ${shepherd}`
          };

          // determine next/previous links
          for (let i of Agenda.index) {
            if (i.shepherd && i.comments) {
              if (i.shepherd.includes(" ")) continue;
              let href = `shepherd/${i.shepherd}`;

              if (i.shepherd > shepherd) {
                if (!item.next || item.next.href > href) {
                  item.next = { title: i.shepherd, href }
                }
              } else if (i.shepherd < shepherd) {
                if (!item.prev || item.prev.href < href) {
                  item.prev = { title: i.shepherd, href }
                }
              }
            }
          };

          return main(item)
        }}
      </Route>

      <Route exact path="/feedback">
        {main({ view: Feedback, title: "Send Feedback" })}
      </Route>

      <Route exact path="/help">
        {() => {
          let item = { view: Help };

          // Progressive Web Application 'Add to Home Screen' support
          if (PageCache.installPrompt) item.buttons = [{ button: Install }];

          return main(item)
        }}
      </Route>

      <Route exact path="/secrets">
        {main({ view: InsiderSecrets })}
      </Route>

      <Route exact path="/bootstrap.html">
        {main({ view: BootStrapPage, title: " " })}
      </Route>

      <Route exact path="/cache/">
        {main({
          view: CacheStatus,
          next: { href: '/server/', title: 'Server' },
          prev: { href: '/store/', title: 'Store' }
        })}
      </Route>

      <Route path="/cache/:page">
        {main({ view: CachePage })}
      </Route>

      <Route exact path="/server/">
        {main({
          view: Server,
          next: { href: '/store/', title: 'Store' },
          prev: { href: '/cache/', title: 'Cache' }
        })}
      </Route>

      <Route exact path="/store/">
        {main({
          view: Store,
          next: { href: '/cache/', title: 'Cache' },
          prev: { href: '/server/', title: 'Server' }
        })}
      </Route>

      <Route exact path="/store/:table">
        {({ match: { params: { table } } }) => (
          main({ view: Store, table })
        )}
      </Route>

      <Route exact path="/store/:table/:id">
        {({ match: { params: { table, id } } }) => (
          main({ view: Store, table, id })
        )}
      </Route>

      <Route exact path="/Discussion-Items">
        {() => {
          let item = this.props.agenda.find(item => /^8[.A-Z]/m.test(item.attach));

          return main({ view: Report, item })
        }}
      </Route>

      <Route path="/:path">
        {({ match: { params: { path } } }) => {
          let view = Report;

          if (this.props.role === 'secretary') {
            if (path === 'Roll-Call') view = RollCall;
            if (path === 'Adjournment') view = Adjournment;
          }

          return main({ view, item: this.find(path) })
        }}
      </Route>
    </Switch>
  }

  find = (path) => {
    let href = '/' + path;
    return this.props.agenda.find(item => item.href === href);
  }
}

export default connect(mapStateToProps)(withRouter(Router))
