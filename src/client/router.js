import Agenda from "./models/agenda.js";
import Backchannel from "./pages/backchannel.js";
import BootStrapPage from "./pages/bootstrap.js";
import CacheStatus, { CachePage } from "./pages/cache.js";
import Comments from "./pages/comments.js";
import Feedback from "./pages/feedback.js";
import Flagged from "./pages/flagged.js";
import Help from "./pages/help.js";
import InsiderSecrets from "./pages/secrets.js";
import Install from "./buttons/install.js";
import Missing from "./pages/missing.js";
import PageCache from "./models/pagecache.js";
import Queue from "./pages/queue.js";
import Rejected from "./pages/rejected.js";
import Search from "./pages/search.js";
import Shepherd from "./pages/shepherd.js";
import User from "./models/user.js";
import { Server } from "./utils.js";
import { InitialReminder, FinalReminder, ProdReminder } from "./buttons/reminders.js";

//
// Routing request based on path and query information in the URL
//
// Additionally provides defaults for color and title, and 
// determines what buttons are required.
//
// Returns item, buttons, and options
class Router {
  // route request based on path and query from the window location (URL)
  static route(path, query) {
    let item, buttons;
    let options = {};

    if (!path || path === ".") {
      item = Agenda
    } else if (path === "search") {
      item = {view: Search, query}
    } else if (path === "comments") {
      item = {view: Comments}
    } else if (path === "backchannel") {
      item = {
        view: Backchannel,
        title: "Agenda Backchannel",
        online: Server.online
      }
    } else if (path === "queue") {
      item = {view: Queue, title: "Queued approvals and comments"};
      if (User.role !== "director") item.title = "Queued comments"
    } else if (path === "flagged") {
      item = {view: Flagged, title: "Flagged reports"}
    } else if (path === "rejected") {
      item = {view: Rejected, title: "Reports which were NOT accepted"}
    } else if (path === "missing") {
      buttons = [{form: InitialReminder}, {button: FinalReminder}];

      if (Agenda.index.some(item => item.nonresponsive)) {
        buttons.push({form: ProdReminder})
      };

      item = {view: Missing, title: "Missing reports", buttons}
    } else if (/^flagged\/[-\w]+$/m.test(path)) {
      item = Agenda.find(path.slice(8));
      options = {traversal: "flagged"}
    } else if (/^queue\/[-\w]+$/m.test(path)) {
      item = Agenda.find(path.slice(6));
      options = {traversal: "queue"}
    } else if (/^shepherd\/queue\/[-\w]+$/m.test(path)) {
      item = Agenda.find(path.slice(15));
      options = {traversal: "shepherd"}
    } else if (/^shepherd\/\w+$/m.test(path)) {
      let shepherd = path.slice(9);

      item = {
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
            if (!item.next || item.next.href > href) item.next = {title: i.shepherd, href}
          } else if (i.shepherd < shepherd) {
            if (!item.prev || item.prev.href < href) item.prev = {title: i.shepherd, href}
          }
        }
      }
    } else if (path === "feedback") {
      item = {view: Feedback, title: "Send Feedback"}
    } else if (path === "help") {
      item = {view: Help};

      // Progressive Web Application 'Add to Home Screen' support
      if (PageCache.installPrompt) item.buttons = [{button: Install}]
    } else if (path === "secrets") {
      item = {view: InsiderSecrets}
    } else if (path === "bootstrap.html") {
      item = {view: BootStrapPage, title: " "}
    } else if (path === "cache/") {
      item = {view: CacheStatus}
    } else if (/^cache\//m.test(path)) {
      item = {view: CachePage}
    } else if (path === "Discussion-Items") {
      item = null;

      for (let i of Agenda.index) {
        if (/^8[.A-Z]/m.test(i.attach)) if (!item) item = i
      };

      if (/^2018-02/m.test(Agenda.date)) {
        item.next = {title: "FY23 Budget Worksheet", href: "fy23"}
      }
    } else {
      item = Agenda.find(path)
    };

    // bail unless an item was found
    if (!item) return {};

    // provide defaults for required properties
    item.color = item.color || "blank";

    if (!item.title) {
      item.title = item.view.options.name.replace(
        /(^|-)\w/g,
        c => c.toUpperCase()
      ).replace(/-/g, " ").trim()
    };

    // determine what buttons are required, merging defaults, form provided
    // overrides, and any overrides provided by the agenda item itself
    buttons = item.buttons;
    if (item.view.buttons) buttons = item.view.buttons().concat(buttons || []);

    if (buttons) {
      buttons = buttons.map((button) => {
        let props = {
          text: "button",
          attrs: {class: "btn"},
          form: button.form
        };

        // form overrides
        let form = button.form;

        if (form && form.button) {
          for (let [name, override] of Object.entries(form.button)) {
            if (name === "text") {
              props.text = form.button.text
            } else if (name === "class" || name === "classname") {
              props.attrs.class += ` ${override.replace(/_/g, "-")}`
            } else {
              props.attrs[name.replace(/_/g, "-")] = override
            }
          }
        } else {
          // no form or form has no separate button: so this is just a button
          delete props.text;
          props.type = button.button || form;
          props.attrs = {item, server: Server}
        };

        // item overrides
        for (let [name, override] of Object.entries(button)) {
          if (name === "text") {
            props.text = button.text
          } else if (name === "class" || name === "classname") {
            props.attrs.class += ` ${override.replace(/_/g, "-")}`
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

    return {item, buttons, options}
  }
};

export default Router