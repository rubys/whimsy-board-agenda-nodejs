import * as Agenda from '../../../server/sources/agenda.js';
import * as Actions from '../../../actions.js';
import reducer from '../agenda.js';

jest.mock('../../../server/svn.js');

describe("agenda reducer", () => {
  it("should link pages in agenda traversal order", async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    agenda = reducer(null, Actions.postAgenda(agenda));

    expect(agenda['Call-to-order'].prev).toBeUndefined();
    expect(agenda['Call-to-order'].next).toBe('Roll-Call');
    expect(agenda['President'].next).toBe('Treasurer');
    expect(agenda['President'].prev).toBe('Chairman');
    expect(agenda['Vice-Chairman'].next).toBe('W3C-Relations');
    expect(agenda['Adjournment'].prev).toBe('Announcements');
    expect(agenda['Adjournment'].next).toBeUndefined();
  })
});