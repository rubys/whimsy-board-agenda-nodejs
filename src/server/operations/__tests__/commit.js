import commit from '../commit.js';
import * as Agenda from '../../sources/agenda.js';
import { Board } from '../../svn.js';
import * as Pending from '../../sources/pending.js';
import * as ldap from '../../ldap.js';

jest.mock('../../svn.js');
jest.mock('../../sources/pending.js');
afterEach(() => {
  Pending.reset();
  Board.reset();
});
afterAll(ldap.close);

describe('commit changes', () => {

  it("should commit pending comments and approvals", async () => {
    let pending = await Pending.read();
    let parsed = await Agenda.read('board_agenda_2015_01_21.txt');
    expect(pending.approved).toContain('7');
    expect(pending.comments['I']).toBe('Nice report!');

    let security = parsed.find(item => item.attach == '9');
    expect(security.approved).toContain('jt');

    let w3c = parsed.find(item => item.attach == '7');
    expect(w3c.approved).not.toContain('jt');

    let avro = parsed.find(item => item.attach == 'I');
    expect(avro.comments).not.toContain('jt: Nice report!')

    let actions = parsed.find(item => item.title == 'Action Items');
    expect(actions.text).not
      .toContain("Clarification provided in this month's report.");

    let request = {
      body: {
        message: "Approve W3C Relations\nComment on BookKeeper\nUpdate 1 AI",
        initials: 'jt'
      }
    };

    await commit(request).then(({ pending, agenda }) => {

      expect(pending.approved).not.toContain('7');
      expect(pending.comments).not.toContain('I');

      security = agenda.find(item => item.attach == '9');
      expect(security.approved).not.toContain('jt');

      w3c = agenda.find(item => item.attach == '7');
      expect(w3c.approved).toContain('jt');

      avro = agenda.find(item => item.attach == 'I');
      expect(avro.comments).toContain('jt: Nice report!');

      actions = agenda.find(item => item.title == 'Action Items');
      expect(actions.text)
        .toContain("Clarification provided in this month's report.");

    })

  })

})