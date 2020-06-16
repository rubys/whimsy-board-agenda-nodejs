import { Link } from "react-router-dom";
import React from "react";
import { htmlEscape } from "../utils.js";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    agenda: state.agenda
  }
};

//
// Search component: 
//  * prompt for search 
//  * display matching paragraphs from agenda, highlighting search strings
//  * keep query string in window location URL in synch
//
class Search extends React.Component {
  // initialize query text based on data passed to the component
  state = { text: new URLSearchParams(this.props.query).get('q') || '' };

  render() {
    let matches = false;
    let text = this.state.text.toLowerCase();

    return <>
      <div className="search">
        <label htmlFor="search_text">Search:</label>
        <input id="search-text" autoFocus value={this.state.text} onChange={this.input} />
      </div>

      {this.state.text.length > 2 ? <>
        {Object.values(this.props.agenda).map(item => {
          let report = item.text || item.report;
          if (!report?.toLowerCase()?.includes(text)) return null;
          matches = true;

          return <section key={item.href}>
            <h4>
              <Link to={item.href}>{item.title}</Link>
            </h4>

            {report.split(/\n\s*\n/).map((paragraph, index) => {
              if (paragraph.toLowerCase().includes(text)) {
                return <pre key={index} className="report"
                  dangerouslySetInnerHTML={{
                    __html: htmlEscape(paragraph).replace(
                      new RegExp(`(${text})`, "gi"),
                      "<span class='hilite'>$1</span>"
                    )
                  }}
                />
              } else {
                return null
              }
            })}
          </section>
        })}

        {!matches ? <p>
          <em>No matches</em>
        </p> : null}
      </> : <p>Please enter at least three characters</p>}
    </>
  };

  // update text whenever input changes
  input = (event) => {
    this.setState({ text: event.target.value })
  };
};

export default connect(mapStateToProps)(Search)