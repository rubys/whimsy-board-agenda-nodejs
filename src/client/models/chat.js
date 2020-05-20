import Agenda from "./agenda.js";
import * as Events from "./events.js";
import Minutes from "./minutes.js";
import { Server, retrieve, post } from "../utils.js";

class Chat {
  static #$log = [];
  static #$topic = {};
  static #$start = new Date().getTime();
  static #$fetch_requested = false;
  static #$backlog_fetched = false;

  // as it says: fetch backlog of chat messages from the server
  static fetch_backlog() {
    if (Chat.#$fetch_requested) return;

    retrieve(
      `chat/${(Agenda.file.match(/\d[\d_]+/) || [])[0]}`,
      "json",

      (messages) => {
        for (let message of messages) {
          Chat.add(message)
        };

        Chat.#$backlog_fetched = true
      }
    );

    // start countdown to meeting
    this.countdown();
    setInterval(this.countdown, 30000);

    // synchonize chat logs
    if (typeof BroadcastChannel !== 'undefined') {
      let channel = new BroadcastChannel("chatsync");

      // ask if there are any earlier data
      channel.postMessage({type: "query", start: Chat.#$start});

      channel.onmessage = (event) => {
        if (event.data.type === "query" && event.data.start > Chat.#$start) {
          // respond with log if requestor started after this window
          channel.postMessage({
            type: "log",
            start: Chat.#$start,
            log: Chat.#$log
          })
        } else if (event.data.type === "log" && event.data.start < Chat.#$start) {
          // merge data from before this window started
          for (let message of event.data.log) {
            if (message.type !== "topic" && message.timestamp < Chat.#$start) {
              Chat.add(message)
            }
          };

          Chat.#$start = event.data.start
        }
      }
    };

    Chat.#$fetch_requested = true
  };

  // set topic to meeting status
  static countdown() {
    let status = Chat.status;
    if (status) Chat.setTopic({subtype: "status", user: "whimsy", text: status})
  };

  // replace topic locally
  static setTopic(entry) {
    if (Chat.#$topic.text === entry.text) return;
    Chat.#$log = Chat.#$log.filter(item => item.type !== "topic");
    entry.type = "topic";
    Chat.#$topic = entry;
    Chat.add(entry);
  };

  // change topic globally
  static changeTopic(entry) {
    if (Chat.#$topic.text === entry.text) return;
    entry.type = "topic";
    entry.agenda = Agenda.file;
    post("message", entry, message => Chat.setTopic(entry))
  };

  // return the chat log
  static get log() {
    return Chat.#$log
  };

  // identify what changed in the agenda
  static agenda_change(before, after) {
    // bootstrap has a single Roll Call entry
    if (!before || before.length <= 1) return;

    // build an index of the 'before' agenda
    let index = {};

    for (let item of before) {
      index[item.title] = item
    };

    // categorize each item in the 'after' agenda
    let add = [];
    let change = [];

    for (let item of after) {
      before = index[item.title];

      if (!before) {
        add.push(item)
      } else if (before.missing || !item.missing) {
        if (before.digest !== item.digest) {
          if (before.missing) {
            add.push(item)
          } else {
            change.push(item)
          }
        };

        delete index[item.title]
      }
    };

    // build a set of messages
    let messages = [];

    if (add.length !== 0) {
      messages.push(`Added: ${add.map(item => item.title).join(", ")}`)
    };

    if (change.length !== 0) {
      messages.push(`Updated: ${change.map(item => item.title).join(", ")}`)
    };

    let missing = Object.values(index);

    if (missing.length !== 0) {
      messages.push(`Deleted: ${missing.map(item => item.title).join(", ")}`)
    };

    // output the messages
    if (messages.length !== 0) {
      for (let message of messages) {
        Chat.add({type: "agenda", user: "agenda", text: message})
      };
    }
  };

  // identify what changed in the reporter drafts
  static reporter_change(before, after) {
    if (!before || !before.drafts || !after || !after.drafts) return;

    // build an index of the 'before' drafts
    let index = {};

    for (let [, item] of before.drafts) {
      index[item.project] = item
    };

    // categorize each item in the 'after' drafts
    let add = [];
    let change = [];

    for (let [, item] of Object.entries(after.drafts)) {
      before = index[item.project];
      console.log([before, item]);

      if (!before) {
        add.push(item)
      } else {
        if (before.text !== item.text) change.push(item);
        delete index[item.project]
      }
    };

    // build a set of messages
    let messages = [];

    if (add.length !== 0) {
      messages.push(`Added: ${add.map(item => item.title).join(", ")}`)
    };

    if (change.length !== 0) {
      messages.push(`Updated: ${change.map(item => item.title).join(", ")}`)
    };

    let missing = Object.values(index);

    if (missing.length !== 0) {
      messages.push(`Deleted: ${missing.map(item => item.title).join(", ")}`)
    };

    // output the messages
    if (messages.length !== 0) {
      for (let message of messages) {
        Chat.add({type: "agenda", user: "reporter", text: message})
      };
    }
  };

  // add an entry to the chat log
  static add(entry) {
    entry.timestamp = entry.timestamp || new Date().getTime();

    if (Chat.#$log.length === 0 || Chat.#$log[Chat.#$log.length - 1].timestamp < entry.timestamp) {
      Chat.#$log.push(entry)
    } else {
      for (let i = 0; i < Chat.#$log.length; i++) {
        if (entry.timestamp <= Chat.#$log[i].timestamp) {
          if (entry.timestamp !== Chat.#$log[i].timestamp || entry.text !== Chat.#$log[i].text) {
            Chat.#$log.splice(i, 0, entry)
          };

          break
        }
      }
    }
  };

  // meeting status for countdown
  static get status() {
    let diff = Agenda.find("Call-to-order").timestamp - new Date().getTime();

    if (Minutes.complete) {
      return "meeting has completed"
    } else if (Minutes.started) {
      return Chat.#$topic.subtype === "status" ? Chat.#$topic.text : "meeting has started"
    } else if (diff > 86400000 * 3 / 2) {
      return `meeting will start in about ${Math.floor(diff / 86400000 + 0.5)} days`
    } else if (diff > 3600000 * 3 / 2) {
      return `meeting will start in about ${Math.floor(diff / 3600000 + 0.5)} hours`
    } else if (diff > 300000) {
      return `meeting will start in about ${Math.floor(diff / 300000 + 0.5) * 5} minutes`
    } else if (diff > 90000) {
      return `meeting will start in about ${Math.floor(diff / 60000 + 0.5)} minutes`
    } else {
      return "meeting will start shortly"
    }
  }
};

// subscriptions
Events.subscribe("chat", (message) => {
  if (message.agenda === Agenda.file) {
    delete message.agenda;
    Chat.add(message)
  }
});

Events.subscribe("info", (message) => {
  if (message.agenda === Agenda.file) {
    delete message.agenda;
    Chat.add(message)
  }
});

Events.subscribe("topic", (message) => {
  if (message.agenda === Agenda.file) Chat.setTopic(message)
});

Events.subscribe("arrive", (message) => {
  Server.online = message.present;

  Chat.add({
    type: "info",
    user: message.user,
    timestamp: message.timestamp,
    text: "joined the chat"
  })
});

Events.subscribe("depart", (message) => {
  Server.online = message.present;

  Chat.add({
    type: "info",
    user: message.user,
    timestamp: message.timestamp,
    text: "left the chat"
  })
});

export default Chat