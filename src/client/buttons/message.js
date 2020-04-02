import Agenda from "../models/agenda.js";
import Chat from "../models/chat.js";
import React from "react";
import { post } from "../utils.js";

//
// Message area for backchannel
//
class Message extends React.Component {
  state = {disabled: false, message: ""};

  // render an input area in the button area (a very w-i-d-e button)
  render() {
    return <form onSubmit={this.sendMessage}>
      <input id="chatMessage" value={this.state.message}/>
    </form>
  };

  // autofocus on the chat message when the page is initially displayed
  mounted() {
    document.getElementById("chatMessage").focus()
  };

  // send message to server
  sendMessage = event => {
    event.stopPropagation();
    event.preventDefault();

    if (this.state.message) {
      post(
        "message",
        {agenda: Agenda.file, text: this.state.message},

        (message) => {
          Chat.add(message);
          this.setState({message: ""})
        }
      )
    };

    return false
  }
};

export default Message