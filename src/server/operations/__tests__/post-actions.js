import potentialActions from '../../sources/potential-actions.js';
import postActions from "../post-actions.js";
import { Board } from '../../svn.js';

jest.mock('../../svn.js');
jest.mock('../../sources/minutes.js');

afterEach(Board.reset);

describe("action items", () => {
  it("should post action items", async () => {
    // fetch potential action items from the secretary's minutes
    let { actions } = await potentialActions();
    let rave = actions.find(action => action.pmc == "Rave");
    expect(rave.text).toMatch(/require a\n      reflow/);

    // post actions
    let request = {
      body: {
       agenda: "board_agenda_2015_02_18.txt",
       message: "Post Action Items",
       actions
      }
    };

    let agenda = await postActions(request);

    // verify that the actions show up in the updated agenda, and are reflowed
    actions = agenda.find(item => item.title == "Action Items").actions;
    rave = actions.find(action => action.pmc == "Rave");
    expect(rave.text).toMatch(/require\n      a reflow/);
  })
})