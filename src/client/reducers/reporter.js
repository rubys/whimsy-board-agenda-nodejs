import * as Actions from '../../actions.js';

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_REPORTER:
      return Object.entries(action.reports.drafts || {})
        .map( ([attach, info]) => ({ ...info, attach }) );

    default:
      return state
  }
}