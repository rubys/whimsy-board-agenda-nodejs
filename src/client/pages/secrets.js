import { Link } from "react-router-dom";
import React from "react";

class InsiderSecrets extends React.Component {
  get render() {
    return <>
      <p>
        Following are some of the less frequently used features that aren't
        prominently highlighted by the UI, but you might find useful.
      </p>

      <ul className="secrets">
        <li>
          <p>
            Want to reflow only part of a report so as to not mess with the
            formatting of a table or other pre-formatted text?  Select the
            lines you want to adjust using your mouse before pressing the
            reflow button.
          </p>
        </li>

        <li>
          <p>
            Want to not use your email client for whatever reason?  Press
            shift before you click a 'send email' button and a form will
            drop down that you can use instead.
          </p>
        </li>

        <li>
          <p>
            Action items have a status (which is either shown with a red background
            if no update has been made or a white background if a status has been
            provided), a date, and a PMC name.
          </p>

          <p>
            The background of the PMC name is either grey if this PMC is not
            reporting this month, or a link to the report itself, and the color of
            the link is the color associated with the report (green if preapproved,
            red if flagged, etc.).  So generally if you see an action item to
            "pursue a report for..." and the link is green, you can confidently
            mark that action as complete.
          </p>

          <p>
            Not sure what the action item was for, and the provided text is not
            enough to jog your memory?  Click on the date link for this action item
            to see the report for that month.
          </p>

        </li>

        <li>
          <p>
            Need to see Whimsy server status, or get debugging info to help
            report a bug?  Start with
            <a href="https://whimsy.apache.org/status/">status</a>
            or
            <a href="https://whimsy.apache.org/test.cgi">test</a>.
          </p>
        </li>
      </ul>

      <Link to=".">Back to the agenda</Link>
    </>
  }
};

export default InsiderSecrets