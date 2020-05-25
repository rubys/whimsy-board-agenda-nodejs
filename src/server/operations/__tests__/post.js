import post from '../post.js';
import * as ldap from '../../ldap.js';
import { Board } from '../../svn.js';

jest.mock('../../svn.js');
afterEach(Board.reset);
afterAll(ldap.close);

describe('Posting an item to the agenda', () => {
  it('should post a new special order', async () => {
    let request = {body : {
      agenda: 'board_agenda_2015_02_18.txt',
      attach: '7?',
      title: 'Establish Test Project',
      report: 'WHEREAS, RESOLVED, and other official words'
    }};

    let agenda = (await post(request)).agenda;

    let resolution = agenda.find(item => item.attach === '7G');
    expect(resolution.title).toBe('Establish Test');
    expect(resolution.text).toBe('WHEREAS, RESOLVED, and other official words');
  })
})
