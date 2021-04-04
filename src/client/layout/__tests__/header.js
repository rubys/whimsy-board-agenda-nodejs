import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, within } from '@testing-library/react';
import store from '../../store.js';
import { Provider } from 'react-redux';
import Header from '../header.js';
import * as Agenda from '../../../server/sources/agenda.js';
import * as Pending from '../../../server/sources/pending.js';
import * as Actions from '../../../actions.js';

jest.mock('../../../server/svn.js');
jest.mock('../../../server/sources/pending.js');

describe('header', () => {
  it('should show an index page without pending actions', async () => {
    store.dispatch(Actions.postServer({
      pending: { approved: [], unapproved: [], flagged: [], unflagged: [], comments: {} },
      user: { userid: 'rubys', firstname: 'Sam' }
    }));

    let agenda = await Agenda.read('board_agenda_2015_01_21.txt');
    store.dispatch(Actions.postAgenda(agenda));

    let container = document.createElement('div');

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Header title="2015-01-21"/>
        </Provider>
      </MemoryRouter>,
      { container }
    );

    // validate title, lack of pending count
    expect(container.querySelector('.navbar.fixed-top.blank .navbar-brand').textContent)
      .toBe('2015-01-21');
    expect(container.querySelector('span.badge-danger a')).toBe(null);
  });

  it('should show an index page with pending actions', async () => {
    store.dispatch(Actions.postServer({
      pending: await Pending.read(),
      user: { userid: 'rubys', firstname: 'Sam' }
    }));

    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    let container = document.createElement('div');

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Header title="2015-02-18"/>
        </Provider>
      </MemoryRouter>,
      { container }
    );

    // validate title, lack of pending count
    expect(container.querySelector('.navbar.fixed-top.blank .navbar-brand').textContent)
      .toBe('2015-02-18');
    expect(container.querySelector('span.badge-danger a').textContent).toBe("5");

    // validate summary
    function summaryCount(label) {
     return within(container).getByText(label)
       .closest('tr').querySelector('td a').textContent
    }

    expect(summaryCount('committee reports')).toBe('84');
    expect(summaryCount('special orders')).toBe('6');
    expect(summaryCount('awaiting preapprovals')).toBe('2');
    expect(summaryCount('flagged report')).toBe('1');
    expect(summaryCount('missing reports')).toBe('19');

    // validate navidation
    expect(container.querySelector('a#agenda').textContent).toBe('Agenda');
    expect(within(container).getByText("Committee Reports")).toHaveAttribute('href', '/Abdera');
    expect(within(container).getByText("Special Orders")).toHaveAttribute('href', '/Change-Geronimo-Chair');
  });
});
