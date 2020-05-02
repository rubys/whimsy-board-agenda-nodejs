import Main from "../layout/main.js";
import PageCache from "../models/pagecache.js";
import React from "react";

//
// Progressive Web Application 'Add to Home Screen' support
//
class Install extends React.Component {
  render() {
    return <button className="btn-primary btn" onClick={this.click}>install</button>
  };

  click(event) {
    PageCache.installPrompt.prompt();

    PageCache.installPrompt.userChoice.then((choice) => {
      console.log(`install: ${choice.outcome}`);
      if (choice.outcome === "accepted") PageCache.installPrompt = null;
    })
  }
};

export default Install