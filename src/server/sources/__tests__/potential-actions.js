import potentialActions from '../potential-actions.js';

jest.mock('../../svn.js');
jest.mock('../minutes.js');

describe("potential action items", () => {
  it("should combine existing and captured actions", async () => {
    let { actions } = await potentialActions();

    let bval = actions.find(action => action.pmc === "BVal");
    expect(bval.owner).toBe("Chris");
    expect(bval.text).toBe("does the project have enough committers to make releases?");
    expect(bval.status).toBe("COMPLETE");

    let wink = actions.find(action => action.pmc === "Wink");
    expect(wink.owner).toBe("Doug");
    expect(wink.text).toBe("Is the project ready to retire?");
    expect(wink.date).toBe("2015-01-21");
  })
})
