import minute from '../minute.js';
import { read, reset } from '../../sources/minutes.js';

jest.mock('../../sources/minutes.js');
jest.mock('../../svn.js');
afterEach(reset);

//
// Post minutes - secretary
//
describe("minutes", () => {
  it("should update roll call", async () => {
    let request = {
      body: {
        agenda: "board_agenda_2015_02_18.txt",
        action: "attendance",
        id: "gstein",
        name: "Greg Stein",
        present: true
      }
    };

    let { items } = await read("board_agenda_2015_02_18.txt");
    expect(items["Roll Call"]).toMatch(/Directors Absent:.*Greg Stein/ms);

    items = (await minute(request)).items;
    expect(items["Roll Call"]).toMatch(/Greg Stein\s+Directors Absent/);
  });

  it("should post minutes", async () => {
    let request = {
      body: {
        agenda: "board_agenda_2015_02_18.txt",
        title: "Incubator",
        text: "Another month without comments!"
      }
    };

    let minutes = await minute(request);

    expect(minutes.items.Incubator).toBe(request.body.text);
  });

  it("should post timestamp", async () => {
    let request = {
      body: {
        agenda: "board_agenda_2015_02_18.txt",
        title: "Adjournment",
        action: "timestamp"
      }
    };

    let minutes = await minute(request);

    expect(minutes.items.Adjournment).toMatch(/^\d\d?:\d\d$/m);
  })
})