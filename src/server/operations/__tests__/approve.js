import approve from '../approve.js';
import * as Pending from '../../sources/pending.js';

jest.mock('../../svn.js');
jest.mock('../../sources/pending.js');

describe('flags and approvals', () => {

  it("should approve a report", async () => {
    let request = {
      body: {
        agenda: "board_agenda_2015_01_21.txt",
        initials: "jt",
        attach: "C",
        request: "approve"
      }
    };

    let pending = await approve(request);

    expect(pending.approved).toContain("C")
  });

  it("should unapprove a report which is pending approval", async () => {
    let pending = await Pending.read();

    expect(pending.approved).toContain("7");

    let request = {
      body: {
        agenda: "board_agenda_2015_01_21.txt",
        initials: "jt",
        attach: "7",
        request: "unapprove"
      }
    };

    pending = await approve(request);

    expect(pending.approved).not.toContain("7")
  });

  it("should unapprove a previously approved report", async () => {
    let pending = await Pending.read();

    expect(pending.unapproved).not.toContain("BM");

    let request = {
      body: {
        agenda: "board_agenda_2015_01_21.txt",
        initials: "jt",
        attach: "BM",
        request: "unapprove"
      }
    };

    pending = await approve(request);

    expect(pending.unapproved).toContain("BM")
  });

  it("should flag a report", async () => {
    let pending = await Pending.read();

    expect(pending.flagged).not.toContain("J");

    let request = {
      body: {
        agenda: "board_agenda_2015_01_21.txt",
        initials: "jt",
        attach: "J",
        request: "flag"
      }
    };

    pending = await approve(request);

    expect(pending.flagged).toContain("J")
  });

  it("should unflag a report", async () => {
    let pending = await Pending.read();

    expect(pending.unflagged).not.toContain("AS");

    let request = {
      body: {
        agenda: "board_agenda_2015_01_21.txt",
        initials: "jt",
        attach: "AS",
        request: "unflag"
      }
    };

    pending = await approve(request);

    expect(pending.unflagged).toContain("AS")
  });

  it("should unflag a report which is pending being flagged", async () => {
    let pending = await Pending.read();

    expect(pending.flagged).toContain("H");

    let request = {
      body: {
        agenda: "board_agenda_2015_01_21.txt",
        initials: "jt",
        attach: "H",
        request: "unflag"
      }
    };

    pending = await approve(request);

    expect(pending.flagged).not.toContain("H")
  });

});
