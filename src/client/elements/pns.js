import { lookup } from '../store.js';
import { connect } from 'react-redux';

// return the podling name search data
function mapStateToProps(state, props) {
  return {
    pns: lookup('podlingNameSearch')
  }
};

//
// Determine status of podling name
//
function PodlingNameSearch({ item, pns }) {

  let results = null;
  let name = (item.title.match(/Establish (.*)/) || [])[1];

  // if full title contains a name in parenthesis, check for that name too
  let altname = (item.fulltitle.match(/\((.*?)\)/) || [])[1];

  if (name && pns) {
    for (let [podling, jira] of Object.entries(pns)) {
      if (name === podling || altname === podling) results = jira
    }
  };

  return <span className="pns" title="podling name search">{
    !pns || Object.keys(pns).length === 0 ?
      null
    : !results ?
      <a title="No PODLINGNAMESEARCH found" href="https://issues.apache.org/jira/secure/CreateIssue!default.jspa">✘</a>
    : results.resolution === "Fixed" ?
      <a href={"https://issues.apache.org/jira/browse/" + results.issue}>✔</a>
    : <a href={"https://issues.apache.org/jira/browse/" + results.issue}>﹖</a>
  }</span>
};

export default connect(mapStateToProps)(PodlingNameSearch);
