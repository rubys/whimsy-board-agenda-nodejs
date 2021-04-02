import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import store from '../../store.js';
import { Provider } from 'react-redux';
import Footer from '../footer.js';
import * as Agenda from '../../../server/sources/agenda.js';
import * as Actions from '../../../actions.js';

jest.mock('../../../server/svn.js');
jest.mock('../../../server/sources/pending.js');

function renderFooter(item, traversal = "") {
  const container = document.createElement('div');

  let { queryByLabelText } = render(
    <MemoryRouter>
      <Provider store={store}>
        <Footer item={store.getState().agenda[item]} traversal={traversal} />
      </Provider>
    </MemoryRouter>,
    { container }
  )

  return {
    prev: queryByLabelText('prev'),
    next: queryByLabelText('next')
  }
}

describe('footer', () => {
  it('should support "normal" traversal', async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    // first item in the sequence - no backlink
    let callToOrder = renderFooter('Call-to-order');
    expect(callToOrder.prev).toBe(null);
    expect(callToOrder.next).toHaveTextContent('Roll Call');

    // last executive officer - skip VPs that report to the president
    let viceChairman = renderFooter('Vice-Chairman');
    expect(viceChairman.prev).toHaveTextContent('Executive Vice President');
    expect(viceChairman.next).toHaveTextContent('W3C Relations');

    // missing report - normal traversal
    let hama = renderFooter('Hama');
    expect(hama.prev).toHaveTextContent('Hadoop');
    expect(hama.next).toHaveTextContent('HBase');

    // last item in the agenda - no nextlink
    let adjournment = renderFooter('Adjournment');
    expect(adjournment.prev).toHaveTextContent('Announcements');
    expect(adjournment.next).toBe(null);
  });

  it('should support "queue" traversal', async () => {
    store.dispatch(Actions.postServer({
      pending: { approved: [], unapproved: [], flagged: [], unflagged: [], comments: {} },
      user: { userid: 'gstein', firstname: 'Greg', initials: 'gs' }
    }));
    
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    // first of Greg's pending reports
    let ace = renderFooter('January-21-2015', 'queue');
    expect(ace.prev).toHaveAttribute('href', '/queue');
    expect(ace.next).toHaveAttribute('href', '/queue/BookKeeper');

    // report in the middle of Greg's pending list
    let mesos = renderFooter('Creadur', 'queue');
    expect(mesos.prev).toHaveAttribute('href', '/queue/BookKeeper');
    expect(mesos.next).toHaveAttribute('href', '/queue/Incubator');

    // report in the end of Gregs's pending list
    let velocity = renderFooter('Tomcat', 'queue');
    expect(velocity.prev).toHaveAttribute('href', '/queue/Incubator');
    expect(velocity.next).toHaveAttribute('href', '/queue');
  });

  it('should support "flagged" traversal', async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    // last officer - since the meeting started, next in traversal is a flagged report
    let securityTeam = renderFooter('Security-Team');
    expect(securityTeam.prev).toHaveAttribute('href', '/Legal-Affairs');
    expect(securityTeam.next).toHaveAttribute('href', '/flagged/Abdera');

    // first missing report - prevlink is non-flagged
    let abdera = renderFooter('Abdera', 'flagged');
    expect(abdera.prev).toHaveAttribute('href', '/Security-Team');
    expect(abdera.next).toHaveAttribute('href', '/flagged/Airavata');

    // missing report - middle of the pack
    let hama = renderFooter('Hama', 'flagged');
    expect(hama.prev).toHaveAttribute('href', '/flagged/DirectMemory');
    expect(hama.next).toHaveAttribute('href', '/flagged/HttpComponents');

    // last missing report - nextlink is non-flagged
    let xerces = renderFooter('Xerces', 'flagged');
    expect(xerces.prev).toHaveAttribute('href', '/flagged/Tuscany');
    expect(xerces.next).toHaveAttribute('href', '/Change-Geronimo-Chair');

    // first special order - since the meeting state, prev in traversal is a flagged report
    let changeGeronimoChair = renderFooter('Change-Geronimo-Chair');
    expect(changeGeronimoChair.prev).toHaveAttribute('href', '/flagged/Xerces');
    expect(changeGeronimoChair.next).toHaveAttribute('href', '/Change-ServiceMix-Chair');
  });

  it('should support "shepherd" traversal', async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    // first of Sam's shepherd reports
    let ace = renderFooter('ACE', 'shepherd');
    expect(ace.prev).toHaveAttribute('href', '/shepherd/Sam');
    expect(ace.next).toHaveAttribute('href', '/shepherd/queue/Axis');

    // report in the middle of Sam's shepherd list
    let mesos = renderFooter('Mesos', 'shepherd');
    expect(mesos.prev).toHaveAttribute('href', '/shepherd/queue/Hama');
    expect(mesos.next).toHaveAttribute('href', '/shepherd/queue/Oozie');

    // report in the end of Sam's shepherd list
    let velocity = renderFooter('Velocity', 'shepherd');
    expect(velocity.prev).toHaveAttribute('href', '/shepherd/queue/Perl');
    expect(velocity.next).toHaveAttribute('href', '/shepherd/Sam');
  });
});
