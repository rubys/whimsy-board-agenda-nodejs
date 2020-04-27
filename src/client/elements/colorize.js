import React from 'react';
import { connect } from 'react-redux';

// inject color (CSS property) into child element's className

function mapStateToProps({ minutes, server: { pending, drafts } }) {
  return { minutes, pending, drafts }
};

function Colorize({ item, minutes, pending, drafts, children }) {

  let color = (() => {
    if (!item?.attach) {
      return "blank"
    } if (flagged()) {
      return "commented"
    } else if (item.color) {
      return item.color
    } else if (!item.title) {
      return "blank"
    } else if (missing()) {
      return "missing"
    } else if (item.approved) {
      return item.approved.length < 5 ? "ready" : "reviewed"
    } else if (item.title === "Action Items") {
      if (item.actions.length === 0) {
        return "missing"
      } else if (item.actions.some(action => action.status.length === 0)) {
        return "ready"
      } else {
        return "reviewed"
      }
    } else if (item.text || item.report) {
      return "available"
    } else if (item.text === undefined) {
      return "missing"
    } else {
      return "reviewed"
    }
  })();

  // add color to className and return
  let child = React.Children.only(children);
  if (child.props.className) color = `${child.props.className} ${color}`;
  return React.cloneElement(child, { className: color });

  // determine if this item is flagged, accounting for pending actions
  function flagged() {
    if (pending.flagged?.includes(item.attach)) return true;
    if (!item.flagged_by) return false;

    if (item.flagged_by.length === 1 && item.flagged_by[0] === pending.initials && pending.unflagged?.includes(item.attach)) {
      return false
    };

    return true
  };

  // override missing if there are warnings, the report was rejected, or draft minutes are present
  function missing() {
    if (item.missing || item.warnings || minutes?.rejected?.includes(item.title)) {
      return true
    } else if (/^3\w$/m.test(item.attach)) {
      if (drafts.includes((item.text.match(/board_minutes_\w+.txt/) || [])[0])) {
        return false
      } else if (minutes?.[item.title] === "approved") {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  };

}

export default connect(mapStateToProps)(Colorize)