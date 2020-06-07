import attend from '../attend.js';

jest.mock('../../svn.js');

describe('roll call', () => {
  it('should support adding a guest', async () => {
    let request = {
      body: {
        agenda: 'board_agenda_2015_01_21.txt',
        action: 'attend',
        name: 'N. E. Member'
      }
    };

    let { agenda } = await attend(request);

    let rollcall = agenda.find(item => item.title == 'Roll Call');
    expect(rollcall.text).toMatch(/Guests.*N\. E\. Member/s);
    expect(rollcall.text).toContain('Shane Curcuru');
  });

  it('should support removing a guest', async () => {
    let request = {
      body: {
        agenda: 'board_agenda_2015_01_21.txt',
        action: 'regrets',
        name: 'Shane Curcuru'
      }
    };

    let { agenda } = await attend(request);

    let rollcall = agenda.find(item => item.title == 'Roll Call');
    expect(rollcall.text).not.toContain('Shane Curcuru');
  });

  it("should support a director's regrets", async () => {
    let request = {
      body: {
        agenda: 'board_agenda_2015_01_21.txt',
        action: 'regrets',
        name: 'Sam Ruby'
      }
    };

    let { agenda } = await attend(request);

    let rollcall = agenda.find(item => item.title == 'Roll Call');
    expect(rollcall.text).toMatch(/Directors .* Absent:\s+Sam Ruby/);
  });

  it("should support moving a director back to attending", async () => {
    let request = {
      body: {
        agenda: 'board_agenda_2015_02_18.txt',
        action: 'attend',
        name: 'Greg Stein'
      }
    };

    let { agenda } = await attend(request);

    let rollcall = agenda.find(item => item.title == 'Roll Call');
    expect(rollcall.text).toMatch(/Greg Stein\s+Directors .* Absent:/);
  });

  it("should support adding an officer", async () => {
    let request = {
      body: {
        agenda: 'board_agenda_2015_01_21.txt',
        action: 'attend',
        name: 'Craig L Russell'
      }
    };

    let { agenda } = await attend(request);

    let rollcall = agenda.find(item => item.title == 'Roll Call');
    expect(rollcall.text).toMatch(/Officers .* Present:\s+Craig L Russell/);
    expect(rollcall.text).toMatch(/Officers .* Absent:\s+none/);
  });

  it("should support a officer's regrets", async () => {
    let request = {
      body: {
        agenda: 'board_agenda_2015_02_18.txt',
        action: 'regrets',
        name: 'Craig L Russell'
      }
    };

    let { agenda } = await attend(request);

    let rollcall = agenda.find(item => item.title == 'Roll Call');
    expect(rollcall.text).toMatch(/Officers .* Present:\s+none/);
    expect(rollcall.text).toMatch(/Officers .* Absent:\s+Craig L Russell/);
  });
})
