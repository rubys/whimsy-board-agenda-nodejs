import React from "react";
import { Server, retrieve } from "../utils.js";

//
// Determine status of podling name
//
class PodlingNameSearch extends React.Component {
  render() {
    let results = null;
    let name = (this.props.item.title.match(/Establish (.*)/) || [])[1];

    // if full title contains a name in parenthesis, check for that name too
    let altname = (this.props.item.fulltitle.match(/\((.*?)\)/) || [])[1];

    if (name && Server.podlingnamesearch) {
      for (let [podling, jira] of Object.entries(Server.podlingnamesearch)) {
        if (name === podling || altname === podling) results = jira
      }
    };

    return <>
      <span className="pns" title="podling name search">{Server.podlingnamesearch ? !results ? <a title="No PODLINGNAMESEARCH found" href="https://issues.apache.org/jira/secure/CreateIssue!default.jspa">✘</a> : results.resolution === "Fixed" ? <a href={"https://issues.apache.org/jira/browse/" + results.issue}>✔</a> : <a href={"https://issues.apache.org/jira/browse/" + results.issue}>﹖</a> : null}</span>
    </>
  };

  // initial mount: fetch podlingnamesearch data unless already downloaded
  mounted() {
    if (!Server.podlingnamesearch) {
      retrieve("podlingnamesearch", "json", (results) => {
        Server.podlingnamesearch = results;
        React.forceUpdate()
      })
    }
  }
};

export default PodlingNameSearch