import * as Actions from '../../actions.js';

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_HISTORICAL_COMMENTS:
      return action.comments;

    default:
      return state
  }
}

reduce.lookup = () => (
  { path: 'historical-comments', initialValue: {} }
)