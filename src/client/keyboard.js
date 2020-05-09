import Agenda from "./models/agenda.js";
import Chat from "./models/chat.js";
import Main from "./layout/main.js";
import Minutes from "./models/minutes.js";
import User from "./models/user.js";
import { navigate } from "./router.js";
import jQuery from "jquery";
import { post } from "./utils.js";
import Store from './store.js';
import * as Actions from "../actions.js";

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

      if (event.keyCode === 37) { // left arrow
        let link = document.querySelector("a[rel=prev]");

        if (link) {
          link.click();
          return false
        }

      } else if (event.keyCode === 39) { // right arrow
        let link = document.querySelector("a[rel=next]");

        if (link) {
          link.click();
          return false
        }

      } else if (event.keyCode === 13) { // enter
        let link = document.querySelector(".default");
        if (link) navigate(link.getAttribute("href"));
        return false

      } else if (event.keyCode === 67) { // C
        let link = document.getElementById("comments");

        if (link) {
          jQuery("html, body").animate({scrollTop: link.offsetTop}, "slow")
        } else {
          navigate("/comments")
        };

        return false

      } else if (event.keyCode === 73) { // I
        let info = document.getElementById("info");
        if (info) info.click();
        return false

      } else if (event.keyCode === 77) { // M
        navigate("/missing");
        return false

      } else if (event.keyCode === 78) { // N
        document.getElementById("nav").click();
        return false

      } else if (event.keyCode === 65) { // A
        navigate("/");
        return false

      } else if (event.keyCode === 83) { // S
        if (event.shiftKey) {
          User.role = "secretary";
        } else {
          link = document.getElementById("shepherd");
          if (link) navigate(link.getAttribute("href"))
        };

        return false

      } else if (event.keyCode === 88) { // X
        if (Main.item.attach && Minutes.started && !Minutes.complete) {
          Chat.changeTopic({
            user: User.userid,
            link: Main.item.href,
            text: `current topic: ${Main.item.title}`
          });

          return false
        }

      } else if (event.keyCode === 81) { // Q
        navigate("/queue");
        return false

      } else if (event.keyCode === 70) { // F
        navigate("/flagged");
        return false

      } else if (event.keyCode === 66) { // 8
        navigate("/backchannel");
        return false

      } else if (event.shiftKey && event.keyCode === 191) { // ?
        navigate("/help");
        return false

      } else if (event.keyCode === 82) { // R
        Store.dispatch(Actions.clockIncrement());

        post("refresh", {agenda: Agenda.file}, (response) => {
          Store.dispatch(Actions.clockDecrement());
          Agenda.load(response.agenda, response.digest);
        });

        return false

      } else if (event.keyCode === 61 || event.keyCode === 187) { // =
        if (event.shiftKey) {
          navigate("/cache/");
        } else {
          navigate("/store/");
        }
        return false
      }
    }
  }
};

export default Keyboard
