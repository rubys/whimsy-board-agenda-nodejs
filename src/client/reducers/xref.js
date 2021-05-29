import * as Actions from '../../actions.js';

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_XREF:
      return action.xref;

    default:
      return state
  }
}

reduce.lookup = () => (
  { path: 'xref', initialValue: {} }
)
