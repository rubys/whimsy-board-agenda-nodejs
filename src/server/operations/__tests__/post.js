import post from '../post.js';
import * as ldap from '../../ldap.js';
import * as Agenda from '../../sources/agenda.js';
import { Board } from '../../svn.js';

jest.mock('../../svn.js');
afterEach(Board.reset);
afterAll(ldap.close);

describe('Posting an item to the agenda', () => {
  it('should post a new special order', async () => {
    let request = {
      body: {
        agenda: 'board_agenda_2015_02_18.txt',
        attach: '7?',
        title: 'Establish Test Project',
        report: 'WHEREAS, RESOLVED, and other official words'
      }
    };

    let agenda = (await post(request)).agenda;

    let resolution = agenda.find(item => item.attach === '7G');
    expect(resolution.title).toBe('Establish Test');
    expect(resolution.text).toBe('WHEREAS, RESOLVED, and other official words');
  })

  it("should post/edit a report", async () => {
    let agenda = 'board_agenda_2015_02_18.txt';
    let parsed = await Agenda.read(agenda);
    let poi = parsed.find(item => item.title === 'POI');

    let request = {
      body: {
        agenda,
        attach: poi.attach,
        digest: poi.digest,
        message: 'Dummy report for POI',
        report: 'Nothing to see here.  Move along.'
      }
    };

    parsed = (await post(request)).agenda;

    poi = parsed.find(item => item.title === 'POI');
    expect(poi.report).toBe('Nothing to see here.  Move along.')
  })
})
