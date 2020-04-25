export const CLOCK_INCREMENT = 'CLOCK_INCREMENT';
export const CLOCK_DECREMENT = 'CLOCK_DECREMENT';
export const POST_AGENDA = 'POST_AGENDA';
export const POST_SERVER = 'POST_SERVER';
export const POST_HISTORICAL_COMMENTS = "POST_HISTORICAL_COMMENTS";
export const POST_RESPONSES="POST_RESPONSES";
export const SET_MEETING_DATE="MEETING_DATE";

export const clockIncrement = () => ({ type: CLOCK_INCREMENT });
export const clockDecrement = () => ({ type: CLOCK_DECREMENT });

export const postAgenda = (index) => ({ type: POST_AGENDA, index });
export const postServer = (server) => ({ type: POST_SERVER, server });

export const meetingDate = (date) => ({ type: SET_MEETING_DATE, date });

export const historicalComments = (comments) => ({ type: POST_HISTORICAL_COMMENTS, comments});
export const responses = (messages) => ({ type: POST_RESPONSES, messages })