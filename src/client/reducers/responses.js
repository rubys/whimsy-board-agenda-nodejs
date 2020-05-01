import * as Actions from '../../actions.js';

export default function reduce(state = null, action) {
  switch (action.type) {
    case Actions.POST_RESPONSES:
      // input is organized by date; flip it so that it is organized by title instead.
      let responses = {};
      for (let [date, messages] of Object.entries(action.messages)) {
        for (let [title, count] of Object.entries(messages)) {
          if (!responses[title]) responses[title] = {};
          responses[title][date] = count;
        } 
      }
      return responses;

    default:
      return state
  }
}
