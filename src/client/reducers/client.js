import * as Actions from '../../actions.js';

export default function reduce(state = {offline: false}, action) {
  switch (action.type) {
    case Actions.SET_MEETING_DATE:
      return { ...state, meetingDate: action.date};

    default:
      return state
  }
}