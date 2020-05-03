import * as Actions from '../../actions.js';

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_REPORTER:
      return Object.fromEntries(
        Object.entries(action.drafts || {})
          .map(([attach, info]) => ([info.title, { ...info, attach }])));

    default:
      return state
  }
}

reduce.lookup = state => {
  let { client: { agendaFile } } = state;

  let initialValue = [];

  if (agendaFile) {
    return {
      path: 'reporter', initialValue, filter: response => {
        if (response.agenda === agendaFile) {
          return response.drafts;
        } else {
          return initialValue;
        }
      }
    }
  } else {
    return { initialValue }
  }
}