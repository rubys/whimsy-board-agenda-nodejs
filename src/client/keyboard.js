import Agenda from "./models/agenda.js";
import Chat from "./models/chat.js";
import Header from "./layout/header.js";
import Main from "./layout/main.js";
import Minutes from "./models/minutes.js";
import User from "./models/user.js";
import { jQuery } from "jquery";
import { post } from "./utils.js";

//
// Respond to keyboard events
//
class Keyboard {
  static initEventHandlers() {
    // keyboard navigation (unless on the search screen)
    document.body.onkeydown = function(event) {
      let link;

      if (event.metaKey || event.ctrlKey || event.altKey || document.getElementById("search-text") || document.querySelector(".modal.in") || [
        "input",
        "textarea"
      ].includes(document.activeElement.tagName.toLowerCase())) return;

      if (event.keyCode === 37) {
        let link = document.querySelector("a[rel=prev]");

        if (link) {
          link.click();
          return false
        }
      } else if (event.keyCode === 39) {
        let link = document.querySelector("a[rel=next]");

        if (link) {
          link.click();
          return false
        }
      } else if (event.keyCode === 13) {
        let link = document.querySelector(".default");
        if (link) Main.navigate(link.getAttribute("href"));
        return false
      } else if (event.keyCode === 67) {
        let link = document.getElementById("comments");

        if (link) {
          jQuery("html, body").animate({scrollTop: link.offsetTop}, "slow")
        } else {
          Main.navigate("comments")
        };

        return false
      } else if (event.keyCode === 73) {
        let info = document.getElementById("info");
        if (info) info.click();
        return false
      } else if (event.keyCode === 77) {
        Main.navigate("missing");
        return false
      } else if (event.keyCode === 78) {
        document.getElementById("nav").click();
        return false
      } else if (event.keyCode === 65) {
        Main.navigate(".");
        return false
      } else if (event.keyCode === 83) {
        if (event.shiftKey) {
          User.role = "secretary";
          Main.refresh()
        } else {
          link = document.getElementById("shepherd");
          if (link) Main.navigate(link.getAttribute("href"))
        };

        return false
      } else if (event.keyCode === 88) {
        if (Main.item.attach && Minutes.started && !Minutes.complete) {
          Chat.changeTopic({
            user: User.userid,
            link: Main.item.href,
            text: `current topic: ${Main.item.title}`
          });

          return false
        }
      } else if (event.keyCode === 81) {
        Main.navigate("queue");
        return false
      } else if (event.keyCode === 70) {
        Main.navigate("flagged");
        return false
      } else if (event.keyCode === 66) {
        Main.navigate("backchannel");
        return false
      } else if (event.shiftKey && event.keyCode === 191) {
        Main.navigate("help");
        return false
      } else if (event.keyCode === 82) {
        Header.clock_counter++;
        Main.refresh();

        post("refresh", {agenda: Agenda.file}, (response) => {
          Header.clock_counter--;
          Agenda.load(response.agenda, response.digest);
          Main.refresh()
        });

        return false
      } else if (event.keyCode === 61 || event.keyCode === 187) {
        Main.navigate("cache/");
        return false
      }
    }
  }
};

export default Keyboard