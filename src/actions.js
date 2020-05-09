// Following the advice of https://redux.js.org/recipes/reducing-boilerplate

// Most important design constraints:
//
// 1) Relationship between actions and reducers is M:N.  While many actions may
//    be consumed by exactly one reducer, and many reducers only consume exactly
//    one action, there are actions which are processed by multiple reducers,
//    and reducers that process many actions.
//
// 2) actions are simple JavaScript objects, expressible as JSON.  This means
//    nothing other than strings, numbers, arrays, and objects which only
//    contain these types as values.  Also, objects which contain refrences
//    to the same object.
//
// 3) this source file has no dependencies on either the client or the server
//    as actions can be dispatched from the client or broadcast from the server.

export const CLOCK_DECREMENT = 'CLOCK_DECREMENT';
export const CLOCK_INCREMENT = 'CLOCK_INCREMENT';
export const POST_AGENDA = 'POST_AGENDA';
export const POST_DIGEST = 'POST_DIGEST';
export const POST_HISTORICAL_COMMENTS = "POST_HISTORICAL_COMMENTS";
export const POST_MINUTES = 'POST_MINUTES';
export const POST_PENDING = 'POST_PENDING';
export const POST_REPORTER = "POST_REPORTER";
export const POST_RESPONSES = "POST_RESPONSES";
export const POST_SERVER = 'POST_SERVER';
export const SET_FORKED = "SET_FORKED";
export const SET_ROLE = "SET_ROLE";

export const clockDecrement = () => ({ type: CLOCK_DECREMENT });
export const clockIncrement = () => ({ type: CLOCK_INCREMENT });

export const postAgenda = index => ({ type: POST_AGENDA, index });
export const postDigest = files => ({ type: POST_DIGEST, files });
export const postHistoricalComments = comments => ({ type: POST_HISTORICAL_COMMENTS, comments });
export const postMinutes = (attach, minutes) => ({ type: POST_MINUTES, attach, minutes });
export const postPending = pending => ({ type: POST_PENDING, pending });
export const postReporter = drafts => ({ type: POST_REPORTER, drafts });
export const postResponses = messages => ({ type: POST_RESPONSES, messages });
export const postServer = server => ({ type: POST_SERVER, server });

export const setRole = role => ({ type: SET_ROLE, role });
export const setForked = state => ({ type: SET_FORKED, state });
