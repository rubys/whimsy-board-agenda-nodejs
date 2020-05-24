import attend from '../operations/attend.js';
import * as ldap from '../ldap.js';

jest.mock('../svn.js')
afterAll(ldap.close);

describe('roll call', () => {
  it('should support adding a guest', async () => {
    let request = {
      body: {
        agenda: 'board_agenda_2015_01_21.txt',
        action: 'attend',
        name: 'N. E. Member'
      }
    };

    let agenda = (await attend(request)).agenda;

    let rollcall = agenda.find(item => item.title == 'Roll Call');
    expect(rollcall.text).toMatch(/Guests.*N\. E\. Member/s);
  })
})