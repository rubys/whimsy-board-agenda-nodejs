import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import store from '../../store.js';
import { Provider } from 'react-redux';
import Footer from '../footer.js';
import * as Agenda from '../../../server/sources/agenda.js';
import * as Actions from '../../../actions.js';

jest.mock('../../../server/svn.js');
jest.mock('../../../server/sources/pending.js');

function renderFooter(item, traversal = "") {
  return mount(
    <MemoryRouter>
      <Provider store={store}>
        <Footer item={store.getState().agenda[item]} traversal={traversal} />
      </Provider>
    </MemoryRouter>
  )
}

describe('footer', () => {
  it('should support "normal" traversal', async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    // first item in the sequence - no backlink
    let callToOrder = renderFooter('Call-to-order');
    expect(callToOrder.exists('a.backlink')).toBe(false);
    expect(callToOrder.find('a.nextlink').prop('href')).toBe('/Roll-Call');

    // last executive officer - skip VPs that report to the president
    let viceChairman = renderFooter('Vice-Chairman');
    expect(viceChairman.find('a.backlink').prop('href')).toBe('/Executive-Vice-President');
    expect(viceChairman.find('a.nextlink').prop('href')).toBe('/W3C-Relations');

    // missing report - normal traversal
    let hama = renderFooter('Hama');
    expect(hama.find('a.backlink').prop('href')).toBe('/Hadoop');
    expect(hama.find('a.nextlink').prop('href')).toBe('/HBase');

    // last item in the agenda - no nextlink
    let adjournment = renderFooter('Adjournment');
    expect(adjournment.find('a.backlink').prop('href')).toBe('/Announcements');
    expect(adjournment.exists('a.nextlink')).toBe(false);
  });

  it('should support "flagged" traversal', async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    // last officer - since the meeting started, next in traversal is a flagged report
    let securityTeam = renderFooter('Security-Team');
    expect(securityTeam.find('a.backlink').prop('href')).toBe('/Legal-Affairs');
    expect(securityTeam.find('a.nextlink').prop('href')).toBe('/flagged/Abdera');

    // first missing report - prevlink is non-flagged
    let abdera = renderFooter('Abdera', 'flagged');
    expect(abdera.find('a.backlink').prop('href')).toBe('/Security-Team');
    expect(abdera.find('a.nextlink').prop('href')).toBe('/flagged/Airavata');

    // missing report - middle of the pack
    let hama = renderFooter('Hama', 'flagged');
    expect(hama.find('a.backlink').prop('href')).toBe('/flagged/DirectMemory');
    expect(hama.find('a.nextlink').prop('href')).toBe('/flagged/HttpComponents');

    // last missing report - nextlink is non-flagged
    let xerces = renderFooter('Xerces', 'flagged');
    expect(xerces.find('a.backlink').prop('href')).toBe('/flagged/Tuscany');
    expect(xerces.find('a.nextlink').prop('href')).toBe('/Change-Geronimo-Chair');

    // first special order - since the meeting state, prev in traversal is a flagged report
    let changeGeronimoChair = renderFooter('Change-Geronimo-Chair');
    expect(changeGeronimoChair.find('a.backlink').prop('href')).toBe('/flagged/Xerces');
    expect(changeGeronimoChair.find('a.nextlink').prop('href')).toBe('/Change-ServiceMix-Chair');
  });

  it('should support "shepherd" traversal', async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    // first of Sam's shepherd reports
    let ace = renderFooter('ACE', 'shepherd');
    expect(ace.find('a.backlink').prop('href')).toBe('/shepherd/Sam');
    expect(ace.find('a.nextlink').prop('href')).toBe('/shepherd/queue/Axis');

    // report in the middle of Sam's shepherd list
    let mesos = renderFooter('Mesos', 'shepherd');
    expect(mesos.find('a.backlink').prop('href')).toBe('/shepherd/queue/Hama');
    expect(mesos.find('a.nextlink').prop('href')).toBe('/shepherd/queue/Oozie');

    // report in the end of Sam's shepherd list
    let velocity = renderFooter('Velocity', 'shepherd');
    expect(velocity.find('a.backlink').prop('href')).toBe('/shepherd/queue/Perl');
    expect(velocity.find('a.nextlink').prop('href')).toBe('/shepherd/Sam');
  });
});
