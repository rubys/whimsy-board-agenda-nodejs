import * as Actions from '../../actions.js';

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_PODLING_NAME_SEARCH:
      return action.pns;

    default:
      return state
  }
}

reduce.lookup = () => (
  { path: 'podling-name-search', initialValue: {} }
)
