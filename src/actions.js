// Following the advice of https://redux.js.org/recipes/reducing-boilerplate

export const CLOCK_DECREMENT = 'CLOCK_DECREMENT';
export const CLOCK_INCREMENT = 'CLOCK_INCREMENT';
export const POST_AGENDA = 'POST_AGENDA';
export const POST_DIGEST = 'POST_DIGEST';
export const POST_HISTORICAL_COMMENTS = "POST_HISTORICAL_COMMENTS";
export const POST_MINUTES = 'POST_MINUTES';
export const POST_REPORTER = "POST_REPORTER";
export const POST_RESPONSES = "POST_RESPONSES";
export const POST_SERVER = 'POST_SERVER';
export const SET_FORKED = "SET_FORKED"

export const clockDecrement = () => ({ type: CLOCK_DECREMENT });
export const clockIncrement = () => ({ type: CLOCK_INCREMENT });

export const postAgenda = index => ({ type: POST_AGENDA, index });
export const postDigest = files => ({ type: POST_DIGEST, files });
export const postHistoricalComments = comments => ({ type: POST_HISTORICAL_COMMENTS, comments });
export const postMinutes = (attach, minutes) => ({ type: POST_MINUTES, attach, minutes });
export const postReporter = drafts => ({ type: POST_REPORTER, drafts });
export const postResponses = messages => ({ type: POST_RESPONSES, messages });
export const postServer = server => ({ type: POST_SERVER, server });

export const setForked = state => ({ type: SET_FORKED, state });
