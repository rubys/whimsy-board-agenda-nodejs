import { navigate } from "./router.js";

//
// Respond to swipes
//
class Touch {
  static initEventHandlers() {
    // configuration
    let threshold = 150;
    let limit = 100;
    let allowedTime = 500;

    // state
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    // capture start of swipe
    window.addEventListener("touchstart", (event) => {
      let touchobj = event.changedTouches[0];
      startX = touchobj.pageX;
      startY = touchobj.pageY;
      startTime = new Date().getTime()
    });

    // process end of swipe
    window.addEventListener("touchend", (event) => {
      // ignore if a touch lasted too long
      let elapsed = new Date().getTime() - startTime;
      if (elapsed > allowedTime) return;

      // ignore if a modal dialog is active
      if (document.querySelector(".modal.in")) return;

      // compute distances
      let touchobj = event.changedTouches[0];
      let distX = touchobj.pageX - startX;
      let distY = touchobj.pageY - startY;

      // compute direction
      let swipedir = "none";

      if (Math.abs(distX) >= threshold && Math.abs(distY) <= limit) {
        swipedir = distX < 0 ? "left" : "right"
      } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= limit) {
        swipedir = distY < 0 ? "up" : "down"
      };

      // process swipe event
      switch (swipedir) {
      case "left":
        let link = document.querySelector("a[rel=next]");
        if (link) link.click();
        break;

      case "right":
        link = document.querySelector("a[rel=prev]");
        if (link) link.click();
        break;

      case "up":
      case "down":
        let path = window.history.state.path.replace(/[^/]+\/?$/m, "") || "/";
        // if (path === "shepherd/queue/") path = `/shepherd/${Main.item.shepherd}`;
        if (path === "flagged/") path = "/flagged";
        if (path === "queue/") path = "/queue";
        navigate(path);
        break;

      default:
      }
    })
  }
};

export default Touch
