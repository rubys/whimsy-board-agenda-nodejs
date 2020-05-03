import * as Actions from '../../actions.js';

export default function reduce(state = {offline: false}, action) {
  switch (action.type) {
    case Actions.SET_MEETING_DATE:
      let meetingDate = action.date;
      let agendaFile = `board_agenda_${String(meetingDate).replace(/-/g, '_')}.txt`;
      return { ...state, meetingDate, agendaFile };

    default:
      return state
  }
}