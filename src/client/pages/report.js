import AdditionalInfo from "../elements/additional-info.js";
import Agenda from "../models/agenda.js";
import Email from "../buttons/email.js";
import Info from "../elements/info.js";
import JIRA from "../models/jira.js";
import Posted from "../models/posted.js";
import React from "react";
import Reporter from "../models/reporter.js";
import Text from "../elements/text.js";
import User from "../models/user.js";
import { Server, hotlink, retrieve, Flow, escapeRegExp } from "../utils.js";

//
// A two section representation of an agenda item (typically a PMC report),
// where the two sections will show up as two columns on wide enough windows.
//
// The first section contains the item text, with a missing indicator if
// the report isn't present.  It also contains an inline copy of draft
// minutes for agenda items in section 3.
//
// The second section contains posted comments, pending comments, and
// action items associated with this agenda item.
//
// Filters may be used to highlight or hypertext link portions of the text.
//
class Report extends React.Component {
  render() {
    let warning, draft;

    return <section className="flexbox">
      <section>
        {this.props.item.warnings ? <ul className="missing">
          {this.props.item.warnings}
          <li>{warning}</li>
        </ul> : null}

        <pre className="report">{
          this.props.item.text ?
            <Text raw={this.props.item.text} filters={this.filters} /> :
            this.props.item.missing ? <>
              {draft = Reporter.find(this.props.item)}

              {draft ? <>
                <p>
                  <em>Unposted draft being prepared at </em>
                  <a href={`https://reporter.apache.org/wizard?${draft.project}`}>reporter.apache.org</a>
                  <span>:</span>
                </p>

                <Text raw={draft.text} filters={[this.draft]} />
              </> : <p><em>Missing</em></p>}
            </> : <p><em>Empty</em></p>}</pre>

        {(this.props.item.missing || this.props.item.comments) && this.props.item.mail_list ? <section className="reminder">
          {this.props.item.missing && Posted.get(this.props.item.title).length !== 0 ? <button className="btn-primary btn" data_toggle="modal" data_target="#post-report-form">post report</button> : /^[A-Z]/m.test(this.props.item.attach) && User.firstname && this.props.item.shepherd && User.firstname.startsWith(this.props.item.shepherd.toLowerCase()) ? <p className="comment">
            No report was found on
            <a href="https://lists.apache.org/list.html?board@apache.org">board@apache.org</a>
             archives since the last board report.  If/when a report
             is posted there with a <tt>[Report]</tt>
             tag in the subject line a POST button will appear here
             to assist with the posting the report.
          </p> : null }

          <Email item={this.props.item} />
        </section> : null}

        {this.minutes ? <pre className="comment">{this.minutes === "missing" ? <p>
          <em>missing</em>
        </p> : <Text raw={this.minutes} filters={[hotlink]} />}</pre> : null}
      </section>

      <section>
        <AdditionalInfo item={this.props.item} />

        <div className="report-info">
          <h4>Report Info</h4>
          <Info item={this.props.item} />
        </div>
      </section>
    </section>
  };

  // determine what text filters to run
  get filters() {
    let list = [
      this.linebreak,
      this.todo,
      hotlink,
      this.privates,
      this.jira
    ];

    if (this.props.item.title === "Call to order") {
      list = [this.localtime, hotlink]
    };

    if (this.props.item.people) list.push(this.names);

    if (this.props.item.title === "President") {
      list.push(this.president_attachments)
    };

    if (/^[37][A-Z]$/m.test(this.props.item.attach)) list.push(this.linkMinutes);
    return list
  };

  // special processing for Minutes from previous meetings
  get minutes() {
    if (/^3[A-Z]$/m.test(this.props.item.attach)) {
      // if draft is available, fetch minutes for display
      let date = (this.props.item.text.match(/board_minutes_(\d+_\d+_\d+)\.txt/) || [])[1];

      if (date && typeof this.props.item.minutes === 'undefined' && typeof XMLHttpRequest !== 'undefined') {
        if (this.props.item.mtime) {
          this.props.item.minutes = '';

          retrieve(
            `minutes/${date}?${this.props.item.mtime}`,
            "text",
            minutes => this.props.item.minutes = minutes
          )
        } else {
          this.props.item.minutes = "missing"
        }
      }
    };

    return this.props.item.minutes
  };

  //
  //## filters
  //
  // Highlight todos
  todo(text) {
    return text.replace(/TODO/g, "<span class=\"missing\">TODO</span>")
  };

  // Break long lines, treating HTML Entities (like &amp;) as one character
  linebreak(text) {
    // find long, breakable lines
    let regex = /(&\w+;|.){80}.+/g;
    let result = null;
    let indicies = [];

    while ((result = regex.exec(text))) {
      let line = result[0];
      if (line.replace(/&\w+;/g, ".").length < 80) break;
      let lastspace = /^.*\s\S/m.exec(line);

      if (lastspace && lastspace[0].replace(/&\w+;/g, ".").length - 1 > 40) {
        indicies.unshift([line, result.index])
      }
    };

    // reflow each line found
    for (let info of indicies) {
      let line = info[0];
      let index = info[1];
      let replacement = "<span class=\"hilite\" title=\"reflowed\">" + Flow.text(line) + "</span>";
      text = text.slice(0, index) + replacement + text.slice(index + line.length)
    };

    return text
  };

  // Convert start time to local time on Call to order page
  localtime = (text) => {
    return text.replace(
      /\n(\s+)(Other Time Zones:.*)/,

      (match, spaces, text) => {
        let localtime = new Date(this.props.item.timestamp).toLocaleString();
        return `\n${spaces}<span class='hilite'>Local Time: ${localtime}</span>${spaces}${text}`
      }
    )
  };

  // replace ids with committer links
  names = (text) => {
    let roster = "/roster/committer/";

    for (let [id, person] of Object.entries(this.props.item.people)) {
      let pattern;

      // email addresses in 'Establish' resolutions and (ids) everywhere
      text = text.replace(
        new RegExp(`(\\(|&lt;)(${id})( at |@|\\))`, "g"),

        (m, pre, id, post) => {
          if (person.icla) {
            return post === ")" && person.member ? `${pre}<b><a href='${roster}${id}'>${id}</a></b>${post}` : `${pre}<a href='${roster}${id}'>${id}</a>${post}`
          } else {
            return `${pre}<a class='missing' href='${roster}?q=${person.name}'>${id}</a>${post}`
          }
        }
      );

      // names
      if (person.icla || this.props.item.title === "Roll Call") {
        pattern = escapeRegExp(person.name).replace(/ +/g, "\\s+");

        if (typeof person.member !== 'undefined') {
          text = text.replace(
            new RegExp(pattern, "g"),
            match => `<a href='${roster}${id}'>${match}</a>`
          )
        } else {
          text = text.replace(
            new RegExp(pattern, "g"),
            match => `<a href='${roster}?q=${person.name}'>${match}</a>`
          )
        }
      };

      // highlight potentially misspelled names
      if (person.icla && person.icla !== person.name) {
        let names = person.name.split(/\s+/);
        let iclas = person.icla.split(/\s+/);
        let ok = false;
        ok = ok || names.every(part => iclas.some(icla => icla.includes(part)));
        ok = ok || iclas.every(part => names.some(name => name.includes(part)));

        if (/^Establish/m.test(this.props.item.title) && !ok) {
          text = text.replace(
            new RegExp(escapeRegExp(`${id}'>${person.name}`), "g"),
            `?q=${encodeURIComponent(person.name)}'><span class='commented'>${person.name}</span>`
          )
        } else {
          text = text.replace(
            new RegExp(escapeRegExp(person.name), "g"),
            `<a href='${roster}${id}'>${person.name}</a>`
          )
        }
      };

      // put members names in bold
      if (person.member) {
        pattern = escapeRegExp(person.name).replace(/ +/g, "\\s+");

        text = text.replace(
          new RegExp(pattern, "g"),
          match => `<b>${match}</b>`
        )
      }
    };

    // treat any unmatched names in Roll Call as misspelled
    if (this.props.item.title === "Roll Call") {
      text = text.replace(/(\n\s{4})([A-Z].*)/g, (match, space, name) => (
        `${space}<a class='commented' href='${roster}?q=${name}'>${name}</a>`
      ))
    };

    // highlight any non-apache.org email addresses in establish resolutions
    if (/^Establish/m.test(this.props.item.title)) {
      text = text.replace(
        /(&lt;|\()[-.\w]+@(([-\w]+\.)+\w+)(&gt;|\))/g,

        match => (
          /@apache\.org/.test(match) ? match : "<span class=\"commented\" title=\"non @apache.org email address\">" + match + "</span>"
        )
      )
    };

    // highlight mis-spelling of previous and proposed chair names
    if (this.props.item.title.startsWith("Change") && /\(\w[-_.\w]+\)/.test(text)) {
      text = text.replace(
        /heretofore\s+appointed\s+(\w(\s|.)*?)\s+\(/,
        (text, name) => text.replace(name, `<span class='hilite'>${name}</span>`)
      );

      text = text.replace(
        /chosen\sto\s+recommend\s+(\w(\s|.)*?)\s+\(/,
        (text, name) => text.replace(name, `<span class='hilite'>${name}</span>`)
      )
    };

    return text
  };

  // link to board minutes and other attachments
  linkMinutes(text) {
    text = text.replace(
      /board_minutes_(\d+)_\d+_\d+\.txt/g,

      (match, year) => {
        let link;

        if (Server.drafts.includes(match)) {
          link = `https://svn.apache.org/repos/private/foundation/board/${match}`
        } else {
          link = `http://apache.org/foundation/records/minutes/${year}/${match}`
        };

        return `<a href='${link}'>${match}</a>`
      }
    );

    let footer = "";

    text = text.replace(/Attachment (\w+)/g, (match, attach) => {
      let item = Agenda.index.find(item => item.attach === attach);

      if (item) {
        footer += `<hr/><h4>${match}</h4><pre>${item.text}</pre>`;
        return `<a href='${item.title.replace(/ /g, "-")}'>${match}</a>`
      } else {
        return match
      }
    });

    return text + footer
  };

  // highlight private sections - these sections appear in the agenda but
  // will be removed when the minutes are produced (see models/minutes.rb)
  privates(text) {
    // block of lines (and preceding whitespace) where the first line starts
    // with <private> and the last line ends </private>.
    let private_lines = /^([ \t]*&lt;private&gt;(?:\n|.)*?&lt;\/private&gt;)(\s*)$/migs;

    // mark private sections with class private
    text = text.replace(
      private_lines,
      (match, text) => `<div class='private'>${text}</div>`
    );

    // flag remaining private markers
    let private_tag = /(\s*.\s*)(&lt;\/?private&gt;)(\s*.\s*)/i;

    text = text.replace(private_tag, (match, before, text, after) => {
      if (before.includes(">") || after.includes("<")) {
        return match
      } else if (before.includes("\n") || after.includes("\n")) {
        return match
      } else {
        return `${before}<span class='error' title='private sections must consist only of full lines of text'>${text}</span>${after}`
      }
    });

    return text
  };

  // expand president's attachments
  president_attachments(text) {
    let match = text.match(/Additionally, please see Attachments (\d) through (\d)/);

    if (match) {
      let agenda = Agenda.index;

      for (let i = 0; i < agenda.length; i++) {
        if (!/^\d$/m.test(agenda[i].attach)) continue;

        if (agenda[i].attach >= match[1] && agenda[i].attach <= match[2]) {
          text += `\n  ${agenda[i].attach}. <a ${agenda[i].text.length === 0 ? "class=\"pres-missing\" " : ""}href='${agenda[i].href}'>${agenda[i].title}</a>`
        }
      }
    };

    return text
  };

  // hotlink to JIRA issues
  jira(text) {
    let jira_issue = /(^|\s|\(|\[)([A-Z][A-Z0-9]+)-([1-9][0-9]*)(\.(\D|$)|[,;:\s)\]]|$)/g;

    text = text.replace(jira_issue, (m, pre, name, issue, post) => {
      if (JIRA.find(name)) {
        return `${pre}<a target='_self' href='https://issues.apache.org/jira/browse/${name}-${issue}'>${name}-${issue}</a>${post}`
      } else {
        return `${pre}${name}-${issue}${post}`
      }
    });

    return text
  };

  draft(text) {
    return `<div class='private'>${text}</div>`
  }
};

export default Report