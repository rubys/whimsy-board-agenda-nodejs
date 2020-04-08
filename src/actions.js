export const CLOCK_INCREMENT = 'CLOCK_INCREMENT';
export const CLOCK_DECREMENT = 'CLOCK_DECREMENT';
export const POST_AGENDA = 'POST_AGENDA';
export const HISTORICAL_COMMENTS = "HISTORICAL_COMMENTS";

export const clockIncrement = () => ({ type: CLOCK_INCREMENT });
export const clockDecrement = () => ({ type: CLOCK_DECREMENT });

export const postAgenda = (index) => ({ type: POST_AGENDA, index });

export const historicalComments = (comments) => ({ type: HISTORICAL_COMMENTS, comments});