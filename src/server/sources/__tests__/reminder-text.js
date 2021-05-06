import reminderText from '../reminder-text.js';

jest.mock('../../svn.js');

afterEach(() => {
  jest.restoreAllMocks()
});

describe("reminder text", () => {
  it("should parse the calendar", async () => {
    let request = {params: {reminder: 'reminder1'}};
    let { subject, body } = await reminderText(request);

    expect(subject).toBe('{{{project}}} Board Report due by Wed, May 12th - Initial Reminder');
    expect(body).toContain('by Wed, May 12th');
    expect(body).toContain('Wed, 19 May 2021 at 22:00 UTC');
    expect(body).toContain('http://timeanddate.com/s/2sep');
    expect(body).toContain(' https://whimsy.apache.org/board/agenda/2021-05-19/{{{link}}}');
  });
});
