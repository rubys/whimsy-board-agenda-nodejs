import ActionItems from "../pages/action-items.js";
import Adjournment from "../pages/adjournment.js";
import AddComment from "../buttons/add-comment.js";
import AddMinutes from "../buttons/add-minutes.js";
import Approve from "../buttons/approve.js";
import Attend from "../buttons/attend.js";
import Chat from "./chat.js";
import DraftMinutes from "../buttons/draft-minutes.js";
import * as Events from "./events.js";
import Index from "../pages/index.js";
import Minutes from "./minutes.js";
import PageCache from "./pagecache.js";
import Pending from "./pending.js";
import PublishMinutes from "../buttons/publish-minutes.js";
import Post from "../buttons/post.js";
import Refresh from "../buttons/refresh.js";
import Report from "../pages/report.js";
import RollCall from "../pages/roll-call.js";
import SelectActions from "../pages/select-actions.js";
import Summary from "../buttons/summary.js";
import Timestamp from "../buttons/timestamp.js";
import User from "./user.js";
import Vote from "../buttons/vote.js";
import { Server, splitComments } from "../utils.js";

// This is the client model for an entire Agenda.  Class methods refer to
// the agenda as a whole.  Instance methods refer to an individual agenda
// item.
//
class Agenda {
  #actions;
  #approved;
  #attach;
  #chair;
  #chair_email;
  #color;
  #comments;
  #digest;
  #flagged_by;
  #fulltitle;
  #index;
  #mail_list;
  #missing;
  #mtime;
  #notes;
  #owner;
  #people;
  #prior_reports;
  #report;
  #roster;
  #shepherd;
  #stats;
  #text;
  #timestamp;
  #title;
  #to;
  #warnings;
  static #$index = [];
  static #$etag = null;
  static #$digest = null;
  static #$date = "";
  static #$approved = "?";
  static #$color = "blank";

  // (re)-load an agenda, creating instances for each item, and linking
  // each instance to their next and previous items.
  static load(list, digest) {
    if (!list || list.length === 0) return;
    let before = Agenda.#$index;
    Agenda.#$digest = digest;
    Agenda.#$index = [];
    let prev = null;

    for (let item of list) {
      item = new Agenda(item);
      item.prev = prev;
      if (prev) prev.next = item;
      prev = item;
      Agenda.#$index.push(item)
    };

    // remove president attachments from the normal flow
    for (let pres of Agenda.#$index) {
      let match = pres.title === "President" && pres.text && pres.text.match(/Additionally, please see Attachments (\d) through (\d)/);
      if (!match) continue;

      // find first and last president report; update shepherd along the way
      let first, last;
      first = last = null;

      for (let item of Agenda.#$index) {
        if (item.attach === match[1]) first = item;
        if (first && !last) item._shepherd = item._shepherd || pres.shepherd;
        if (item.attach === match[2]) last = item
      };

      // remove president attachments from the normal flow
      if (first && last && !Minutes.started) {
        first.prev.next = last.next;
        last.next.prev = first.prev;
        last.next.index = first.index;
        first.index = null;
        last.next = pres;
        first.prev = pres
      }
    };

    Agenda.#$date = (new Date(Agenda.#$index[0].timestamp).toISOString().match(/(.*?)T/) || [])[1];
    Chat.agenda_change(before, Agenda.#$index);
    return Agenda.#$index
  };

  // fetch agenda if etag is not supplied
  static fetch(etag, digest) {
    if (etag) {
      Agenda.#$etag = etag
    } else if (digest !== Agenda.#$digest || !Agenda.#$etag) {
      if (PageCache.enabled) {
        let loaded = false;

        // if bootstrapping and cache is available, load it
        if (!digest) {
          caches.open("board/agenda").then(cache => (
            cache.match(`../${Agenda.#$date}.json`).then((response) => {
              if (response) {
                response.json().then((json) => {
                  if (!loaded) Agenda.load(json);
                })
              }
            })
          ))
        };

        // set fetch options: credentials and etag
        let options = {credentials: "include"};
        if (Agenda.#$etag) options.headers = {"If-None-Match": Agenda.#$etag};
        let request = new Request(`../${Agenda.#$date}.json`, options);

        // perform fetch
        fetch(request).then((response) => {
          if (response && response.ok) {
            loaded = true;

            // load response into the agenda
            response.clone().json().then((json) => {
              Agenda.#$etag = response.headers.get("etag");
              Agenda.load(json);
            });

            // save response in the cache
            caches.open("board/agenda").then(cache => cache.put(request, response))
          }
        })
      } else {
        // AJAX fallback
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `../${Agenda.#$date}.json`, true);
        if (Agenda.#$etag) xhr.setRequestHeader("If-None-Match", Agenda.#$etag);
        xhr.responseType = "text";

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText !== "") {
            Agenda.#$etag = xhr.getResponseHeader("ETag");
            Agenda.load(JSON.parse(xhr.responseText));
          }
        };

        xhr.send()
      }
    };

    Agenda.#$digest = digest
  };

  // return the entire agenda
  static get index() {
    return Agenda.#$index
  };

  // find an agenda item by path name
  static find(path) {
    let result = null;
    path = path.replace(/\W+/g, "-");

    for (let item of Agenda.#$index) {
      if (item.href === path) result = item
    };

    return result
  };

  // initialize an entry by copying each JSON property to a class instance
  // variable.
  constructor(entry) {
    for (let [name, value] of Object.entries(entry)) {
      this[`_${name}`] = value
    }
  };

  // provide read-only access to a number of properties 
  get attach() {
    return this._attach
  };

  get title() {
    return this._title
  };

  get owner() {
    return this._owner
  };

  get shepherd() {
    return this._shepherd
  };

  get timestamp() {
    return this._timestamp
  };

  get digest() {
    return this._digest
  };

  get mtime() {
    return this._mtime
  };

  get approved() {
    return this._approved
  };

  get roster() {
    return this._roster
  };

  get prior_reports() {
    return this._prior_reports
  };

  get stats() {
    return this._stats
  };

  get people() {
    return this._people
  };

  get notes() {
    return this._notes
  };

  get chair_email() {
    return this._chair_email
  };

  get mail_list() {
    return this._mail_list
  };

  get warnings() {
    return this._warnings
  };

  get flagged_by() {
    return this._flagged_by
  };

  // provide read/write access to other properties
  get index() {
    return this._index
  };

  set index(index) {
    this._index = index
  };

  set color(color) {
    this._color = color
  };

  get fulltitle() {
    return this._fulltitle || this._title
  };

  // override missing if minutes aren't present
  get missing() {
    if (this._missing) {
      return true
    } else if (/^3\w$/m.test(this._attach)) {
      if (Server.drafts.includes((this._text.match(/board_minutes_\w+.txt/) || [])[0])) {
        return false
      } else if (Minutes.get(this._title) === "approved" || /^Action/m.test(this._title)) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  };

  // report was marked as NOT accepted during the meeting
  get rejected() {
    return Minutes.rejected && Minutes.rejected.includes(this._title)
  };

  // PMC has missed two consecutive months
  get nonresponsive() {
    return this._notes && this._notes.includes("missing") && this._notes.replace(
      /^.*missing/m,
      ""
    ).split(",").length >= 2
  };

  // extract (new) chair name from resolutions
  get chair_name() {
    return this._chair ? this._people[this._chair].name : null
  };

  // compute href by taking the title and replacing all non alphanumeric
  // characters with dashes
  get href() {
    return this._title.replace(/[^a-zA-Z0-9]+/g, "-")
  };

  // return the text or report for the agenda item
  get text() {
    return this._text || this._report
  };

  // return comments as an array of individual comments
  get comments() {
    return splitComments(this._comments)
  };

  // item's comments excluding comments that have been seen before
  get unseen_comments() {
    let visible = [];
    let seen = Pending.seen[this._attach] || [];

    for (let comment of this.comments) {
      if (!seen.includes(comment)) visible.push(comment)
    };

    return visible
  };

  // retrieve the pending comment (if any) associated with this agenda item
  get pending() {
    return Pending.comments && Pending.comments[this._attach]
  };

  // retrieve the action items associated with this agenda item
  get actions() {
    let item, list;

    if (this._title === "Action Items") {
      return this._actions
    } else {
      item = Agenda.find("Action-Items");
      list = [];

      if (item) {
        for (let action of item.actions) {
          if (action.pmc === this._title) list.push(action)
        }
      };

      return list
    }
  };

  get special_orders() {
    let items = [];

    if (/^[A-Z]+$/m.test(this._attach) && this._roster) {
      for (let item of Agenda.index) {
        console.log(item.roster)
        if (/^7\w/m.test(item.attach) && item.roster === this._roster) {
          items.push(item)
        }
      }
    };

    return items
  };

  ready_for_review(initials) {
    return typeof this._approved !== 'undefined' && !this.missing && !this._approved.includes(initials) && !(this._flagged_by && this._flagged_by.includes(initials))
  };

  // determine if this agenda was approved in a later meeting
  static get approved() {
    if (typeof fetch === 'undefined') Agenda.#$approved = "approved";

    if (Agenda.#$approved === "?") {
      let options = {month: "long", day: "numeric", year: "numeric"};

      let date = new Date((Agenda.file.match(/\d\d\d\d_\d\d_\d\d/) || [])[0].replace(
        /_/g,
        "-"
      ) + "T18:30:00.000Z").toLocaleString("en-US", options);

      for (let agenda of Server.agendas) {
        if (agenda <= Agenda.file) continue;

        let url = `../${(agenda.match(/\d\d\d\d_\d\d_\d\d/) || [])[0].replace(
          /_/g,
          "-"
        )}.json`;

        fetch(url, {credentials: "include"}).then((response) => {
          if (response.ok) {
            response.json().then((agenda) => {
              for (let item of agenda) {
                if (item.title === date && item.minutes) Agenda.#$approved = item.minutes
              }
            })
          }
        })
      };

      Agenda.#$approved = "tabled"
    };

    return Agenda.#$approved
  };

  // the default view to use for the agenda as a whole
  static get view() {
    return Index
  };

  // buttons to show on the index page
  static get buttons() {
    let list = [{button: Refresh}];

    if (!Minutes.complete) {
      list.push({form: Post, text: "add item"})
    } else if (["director", "secretary"].includes(User.role)) {
      if (!Minutes.summary_sent) list.push({form: Summary})
    };

    if (User.role === "secretary") {
      if (Agenda.approved === "approved") {
        list.push({form: PublishMinutes})
      } else if (Minutes.ready_to_post_draft) {
        list.push({form: DraftMinutes})
      }
    };

    return list
  };

  // the default banner color to use for the agenda as a whole
  static get color() {
    return Agenda.#$color
  };

  static set color(color) {
    Agenda.#$color = color
  };

  // fetch the start date
  static get date() {
    return Agenda.#$date
  };

  // is today the meeting day?
  static get meeting_day() {
    return new Date().toISOString().slice(0, 10) >= Agenda.#$date
  };

  // the default title for the agenda as a whole
  static get title() {
    return Agenda.#$date
  };

  // the file associated with this agenda
  static get file() {
    return `board_agenda_${Agenda.#$date.replace(/-/g, "_")}.txt`
  };

  // get the digest of the file associated with this agenda
  static get digest() {
    return Agenda.#$digest
  };

  // previous link for the agenda index page
  static get prev() {
    let result = {title: "Help", href: "help"};

    for (let agenda of Server.agendas) {
      let date = (agenda.match(/(\d+_\d+_\d+)/) || [])[1].replace(
        /_/g,
        "-"
      );

      if (date < Agenda.#$date && (result.title === "Help" || date > result.title)) {
        result = {title: date, href: `../${date}/`}
      }
    };

    return result
  };

  // next link for the agenda index page
  static get next() {
    let result = {title: "Help", href: "help"};

    for (let agenda of Server.agendas) {
      let date = (agenda.match(/(\d+_\d+_\d+)/) || [])[1].replace(
        /_/g,
        "-"
      );

      if (date > Agenda.#$date && (result.title === "Help" || date < result.title)) {
        result = {title: date, href: `../${date}/`}
      }
    };

    return result
  };

  // find the shortest match for shepherd name (example: Rich)
  static get shepherd() {
    let shepherd = null;
    let firstname = User.firstname.toLowerCase();

    for (let item of Agenda.index) {
      if (item.shepherd && firstname.startsWith(item.shepherd.toLowerCase()) && (!shepherd || item.shepherd.length < shepherd.lenth)) {
        shepherd = item.shepherd
      }
    };

    return shepherd
  };

  // summary
  static get summary() {
    let results = [];

    // committee reports
    let count = 0;
    let link = null;

    for (let item of Agenda.index) {
      if (/^[A-Z]+$/m.test(item.attach)) {
        count++;
        link = link || item.href
      }
    };

    results.push({
      color: "available",
      count,
      href: link,
      text: "committee reports"
    });

    // special orders
    count = 0;
    link = null;

    for (let item of Agenda.index) {
      if (/^7[A-Z]+$/m.test(item.attach)) {
        count++;
        link = link || item.href
      }
    };

    results.push({
      color: "available",
      count,
      href: link,
      text: "special orders"
    });

    // discussion items
    count = 0;
    link = null;

    for (let item of Agenda.index) {
      if (/^8[.A-Z]+$/m.test(item.attach)) {
        if (item.attach !== "8." || !!item.text) count++;
        link = link || item.href
      }
    };

    results.push({
      color: "available",
      count,
      href: link,
      text: "discussion items"
    });

    // awaiting preapprovals
    count = 0;

    for (let item of Agenda.index) {
      if (item.color === "ready" && item.title !== "Action Items") count++
    };

    results.push({
      color: "ready",
      count,
      href: "queue",
      text: "awaiting preapprovals"
    });

    // flagged reports
    count = 0;

    for (let item of Agenda.index) {
      if (item.flagged_by) count++
    };

    results.push({
      color: "commented",
      count,
      href: "flagged",
      text: "flagged reports"
    });

    // missing reports
    count = 0;

    for (let item of Agenda.index) {
      if (item.missing) count++
    };

    results.push({
      color: "missing",
      count,
      href: "missing",
      text: "missing reports"
    });

    // rejected reports
    count = 0;

    for (let item of Agenda.index) {
      if (item.rejected) count++
    };

    if (Minutes.started || count > 0) {
      results.push({
        color: "missing",
        count,
        href: "rejected",
        text: "not accepted"
      })
    };

    return results
  };

  //
  // Methods on individual agenda items
  //
  // default view for an individual agenda item
  get view() {
    if (this._title === "Action Items") {
      return this._text || Minutes.started ? ActionItems : SelectActions
    } else if (this._title === "Roll Call" && User.role === "secretary") {
      return RollCall
    } else if (this._title === "Adjournment" && User.role === "secretary") {
      return Adjournment
    } else {
      return Report
    }
  };

  // buttons and forms to show with this report
  get buttons() {
    let list = [];

    if (!(!/^\d+$/m.test(this._attach) && this._comments === undefined) && !Minutes.complete) {
      // some reports don't have comments
      if (this.pending) {
        list.push({form: AddComment, text: "edit comment"})
      } else {
        list.push({form: AddComment, text: "add comment"})
      }
    };

    if (this._title === "Roll Call") list.push({button: Attend});

    if (/^(\d+|7?[A-Z]+|4[A-Z]|8[.A-Z])$/m.test(this._attach)) {
      if (User.role === "secretary" || !Minutes.complete) {
        if (!Minutes.draft_posted) {
          if (/^8[.A-Z]/m.test(this._attach)) {
            if (/^8[A-Z]/m.test(this._attach)) {
              list.push({form: Post, text: "edit item"})
            } else if (!this.text || this._text.trim().length === 0) {
              list.push({form: Post, text: "post item"})
            } else {
              list.push({form: Post, text: "edit items"})
            }
          } else if (this.missing) {
            list.push({form: Post, text: "post report"})
          } else if (/^7\w/m.test(this._attach)) {
            list.push({form: Post, text: "edit resolution"})
          } else {
            list.push({form: Post, text: "edit report"})
          }
        }
      }
    };

    if (User.role === "director") {
      if (!this.missing && this._comments !== undefined && !Minutes.complete) {
        if (/^(3[A-Z]|\d+|[A-Z]+)$/m.test(this._attach)) list.push({button: Approve})
      }
    } else if (User.role === "secretary") {
      if (!Minutes.draft_posted) {
        if (/^7\w/m.test(this._attach)) {
          list.push({form: Vote})
        } else if (Minutes.get(this._title)) {
          list.push({form: AddMinutes, text: "edit minutes"})
        } else if (["Call to order", "Adjournment"].includes(this._title)) {
          list.push({button: Timestamp})
        } else {
          list.push({form: AddMinutes, text: "add minutes"})
        }
      };

      if (/^3\w/m.test(this._attach)) {
        if (Minutes.get(this._title) === "approved" && Server.drafts.includes((this._text.match(/board_minutes_\w+\.txt/) || [])[0])) {
          list.push({form: PublishMinutes})
        }
      } else if (this._title === "Adjournment") {
        if (Minutes.ready_to_post_draft) list.push({form: DraftMinutes})
      }
    };

    return list
  };

  // determine if this item is flagged, accounting for pending actions
  get flagged() {
    if (Pending.flagged && Pending.flagged.includes(this._attach)) return true;
    if (!this._flagged_by) return false;

    if (this._flagged_by.length === 1 && this._flagged_by[0] === User.initials && Pending.unflagged.includes(this._attach)) {
      return false
    };

    return this._flagged_by.length !== 0
  };

  // determine if this report can be skipped during the course of the meeting
  get skippable() {
    if (this.flagged) return false;
    if (this.missing && Agenda.meeting_day) return this._to === "president";

    if (this._approved && this._approved.length < 5 && Agenda.meeting_day) {
      return false
    };

    return true
  };

  // banner color for this agenda item
  get color() {
    if (this.flagged) {
      return "commented"
    } else if (this._color) {
      return this._color
    } else if (!this._title) {
      return "blank"
    } else if (this._warnings) {
      return "missing"
    } else if (this.missing || this.rejected) {
      return "missing"
    } else if (this._approved) {
      return this._approved.length < 5 ? "ready" : "reviewed"
    } else if (this.title === "Action Items") {
      if (this.actions.length === 0) {
        return "missing"
      } else if (this.actions.some(action => action.status.length === 0)) {
        return "ready"
      } else {
        return "reviewed"
      }
    } else if (this._text || this._report) {
      return "available"
    } else if (this._text === undefined) {
      return "missing"
    } else {
      return "reviewed"
    }
  };

  // who to copy on emails
  get cc() {
    return this._to === "president" ? "operations@apache.org" : "board@apache.org"
  }
};

Events.subscribe("agenda", (message) => {
  if (message.file === Agenda.file) Agenda.fetch(null, message.digest)
});

Events.subscribe("server", (message) => {
  if (message.drafts) Server.drafts = message.drafts;
  if (message.agendas) Server.agendas = message.agendas
});

export default Agenda