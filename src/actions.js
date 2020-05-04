export const CLOCK_INCREMENT = 'CLOCK_INCREMENT';
export const CLOCK_DECREMENT = 'CLOCK_DECREMENT';
export const POST_AGENDA = 'POST_AGENDA';
export const POST_SERVER = 'POST_SERVER';
export const POST_HISTORICAL_COMMENTS = "POST_HISTORICAL_COMMENTS";
export const POST_REPORTER = "POST_REPORTER";
export const POST_RESPONSES = "POST_RESPONSES";
export const SET_MEETING_DATE = "SET_MEETING_DATE";
export const SET_FORKED = "SET_FORKED"
export const POST_MINUTES = 'POST_MINUTES';
export const POST_DIGEST = 'POST_DIGEST';

export const clockIncrement = () => ({ type: CLOCK_INCREMENT });
export const clockDecrement = () => ({ type: CLOCK_DECREMENT });

export const postAgenda = index => ({ type: POST_AGENDA, index });
export const postServer = server => ({ type: POST_SERVER, server });

export const meetingDate = date => ({ type: SET_MEETING_DATE, date });
export const setForked = state => ({ type: SET_FORKED, state });

export const postHistoricalComments = comments => ({ type: POST_HISTORICAL_COMMENTS, comments });
export const postResponses = messages => ({ type: POST_RESPONSES, messages });
export const postReporter = drafts => ({ type: POST_REPORTER, drafts });

export const postMinutes = (attach, minutes) => ({ type: POST_MINUTES, attach, minutes });

export const postDigest = files => ({ type: POST_DIGEST, files })