import * as Actions from '../../actions.js';

const OneDay = 86_400_000;
let intervalID = null;

export default function reduce(state = { offline: false }, action) {
  switch (action.type) {
    case Actions.POST_AGENDA:
      let timestamp = action.index[0].timestamp;
      state = reduce(state, Actions.setMeetingDate(timestamp))
      return state;

    case Actions.SET_MEETING_DATE:
      let now = new Date().getTime();
      let meetingDate = new Date(action.timestamp).toISOString().slice(0, 10);

      if (meetingDate !== state.meetingDate) {
        if (intervalID) clearInterval(intervalID);
        intervalID = null;

        let meetingDay = action.timestamp - now < OneDay;

        let agendaFile = `board_agenda_${String(meetingDate).replace(/-/g, '_')}.txt`;

        if (!meetingDay) {
          intervalID = setInterval(
            () => reduce(state, Actions.setMeetingDate(action.timestamp)),
            action.timestamp - OneDay - now
          )
        }

        return { ...state, meetingDay, meetingDate, agendaFile };
      }

      return state;

    default:
      return state
  }
}