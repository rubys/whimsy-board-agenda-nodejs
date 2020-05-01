import * as Actions from '../../actions.js';

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_REPORTER:
      return Object.fromEntries(
        Object.entries(action.drafts || {})
        .map( ([attach, info]) => ([info.title, { ...info, attach }]) ));

    default:
      return state
  }
}