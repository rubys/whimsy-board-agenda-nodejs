import Agenda from "../models/agenda.js";
import Chat from "../models/chat.js";
import Link from "../elements/link.js";
import Main from "../layout/main.js";
import Message from "../buttons/message.js";
import React from "react";
import Text from "../elements/text.js";
import User from "../models/user.js";
import { hotlink } from "../utils.js";

//
// Overall Agenda page: simple table with one row for each item in the index
//
class Backchannel extends React.Component {
  // place a message input field in the buttons area
  static buttons() {
    return [{ button: Message }]
  };

  // render a list of messages
  render() {

    let filters;

    let bydate = {};

    let datefmt = timestamp => (
      new Date(timestamp).toLocaleDateString(
        {},
        { month: "short", day: "numeric", year: "numeric" }
      )
    );

    Chat.log.forEach(log => {
      let date = datefmt(log.timestamp);
      if (!bydate[date]) bydate[date] = [];
      bydate[date].push(log);
    });

    return <>
      <header>
        <h1>Agenda Backchannel</h1>
      </header>

      {Chat.log.length === 0 ? Chat.backlog_fetched ? <em>No messages found.</em> : <em>Loading messages</em> : <>

        {Object.entries(bydate).map(([date, msgs], i) => <>
          {i !== 0 || date !== datefmt(new Date().valueOf()) ?
            <h5 className="chatlog">{date}</h5>
            : null};

          {/* group of messages that share the same (local) date */}
          <dl className="chatlog">
            {msgs.map(message => <>
              <dt key={`t${message.timestamp}`} className={message.type} title={new Date(message.timestamp).toLocaleTimeString()}>{message.user}</dt>

              <dd key={`d${message.timestamp}`} className={message.type}>{message.link ? <Link text={message.text} href={message.link} /> : <>
                {filters = [hotlink, this.mention]}
                {message.type === "agenda" ? filters << this.agenda_link : null}
                <Text raw={message.text} filters={filters} />
              </>}</dd>
            </>)}
          }}</dl>
        </>)}
      </>}
    </>
  };

  // highlight mentions of my id
  mention(text) {
    return text.replace(
      new RegExp(`<.*?>|\\b(${User.userid})\\b`, "g"),
      match => match[0] === "<" ? match : `<span class=mention>${match}</span>`
    )
  };

  // link agenda pages
  agenda_link(text) {
    for (let item of Agenda.index) {
      text = text.replace(
        item.title,
        match => `<a href='${item.title.replace(/[\W]/g, "-")}'>${item.title}</a>`
      )
    };

    return text
  };

  // on initial display, fetch backlog
  mounted() {
    Main.scrollTo = -1;
    Chat.fetch_backlog()
  };

  // if we are at the bottom of the page, keep it that way
  beforeUpdate() {
    if (window.pageYOffset + window.innerHeight >= document.documentElement.scrollHeight) {
      Main.scrollTo = -1
    } else {
      Main.scrollTo = null
    }
  }
};

export default Backchannel