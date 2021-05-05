import calendar, { nextMeeting } from '../calendar.js';

jest.mock('../../svn.js');

afterEach(() => {
  jest.restoreAllMocks()
});

describe("calendar", () => {
  it("should parse the calendar", async () => {
    let times = await calendar();

    expect(times.length).toBe(14);

    let meeting = times[0];

    expect(meeting.time).toBe("2021-03-17T20:00:00.000Z");
    expect(meeting.int).toBe(1616011200000);

    meeting = times.pop();

    expect(meeting.time).toBe("2022-04-20T22:00:00.000Z");
    expect(meeting.int).toBe(1650492000000);
  });
});

describe("nextMeeting", () => {
  it("should handle the beginning of the month", async () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() =>
      new Date('2021-05-01T11:01:58.135Z').valueOf()
    );

    let meeting = new Date(await nextMeeting()).toISOString();
    expect(meeting).toBe('2021-05-19T22:00:00.000Z');
  });

  it("should handle the end of the month", async () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() =>
      new Date('2021-05-30T11:01:58.135Z').valueOf()
    );

    let meeting = new Date(await nextMeeting()).toISOString();
    expect(meeting).toBe('2021-06-16T22:00:00.000Z');
  });

  it("early in the month, date past end of list, select later this month", async () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() =>
      new Date('2022-05-01T11:01:58.135Z').valueOf()
    );

    let meeting = new Date(await nextMeeting()).toISOString();
    expect(meeting).toBe('2022-05-18T20:00:00.000Z');
  });

  it("late in the month, date past end of list, select next month", async () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() =>
      new Date('2022-05-30T11:01:58.135Z').valueOf()
    );

    let meeting = new Date(await nextMeeting()).toISOString();
    expect(meeting).toBe('2022-06-15T20:00:00.000Z');
  });
});
