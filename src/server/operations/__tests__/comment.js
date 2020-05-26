import comment from '../comment.js';
import * as Pending from '../../sources/pending.js';

jest.mock('../../sources/pending.js');
afterEach(Pending.reset);

describe('comments', () => {
  it("should post a comment", async () => {
    let request = {
      body: {
        initials: "xx",
        agenda: "board_agenda_2015_01_21.txt",
        attach: "Z",
        comment: "testing"
      }
    };

    let pending = await comment(request);

    expect(pending.comments.Z).toBe("testing");
    expect(pending.initials).toContain("xx");
  });

  it("should remove a comment", async () => {
    let pending = await Pending.read();

    expect(pending.comments.I).toBe("Nice report!");

    let request = {
      body: {
        initials: "xx",
        agenda: "board_agenda_2015_01_21.txt",
        attach: "I",
        comment: null
      }
    };

    pending = await comment(request);

    expect(pending.comments).not.toHaveProperty("I");
  });

});