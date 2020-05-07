import * as Actions from '../../actions.js';

export default function reduce(state = {offline: false}, action) {
  switch (action.type) {
    case Actions.POST_AGENDA:
      let meetingDate = new Date(action.index[0].timestamp).toISOString().slice(0, 10);
      let agendaFile = `board_agenda_${String(meetingDate).replace(/-/g, '_')}.txt`;
      return { ...state, meetingDate, agendaFile };

    default:
      return state
  }
}