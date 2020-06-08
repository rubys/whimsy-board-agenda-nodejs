import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
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
      user: { userid: 'rubys' }
    }));

    let agenda = await Agenda.read('board_agenda_2015_01_21.txt');
    store.dispatch(Actions.postAgenda(agenda));

    const header = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Header title="2015-01-21"/>
        </Provider>
      </MemoryRouter>
    );

    // validate title, lack of pending count
    expect(header.find('.navbar.fixed-top.blank .navbar-brand').text())
      .toBe('2015-01-21');
    expect(header.exists('span.badge-danger a')).toBe(false);
  });

  it('should show an index page with pending actions', async () => {
    store.dispatch(Actions.postServer({
      pending: await Pending.read(),
      user: { userid: 'rubys' }
    }));

    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    const header = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Header title="2015-02-18"/>
        </Provider>
      </MemoryRouter>
    );

    // validate title, lack of pending count
    expect(header.find('.navbar.fixed-top.blank .navbar-brand').text())
      .toBe('2015-02-18');
    expect(header.find('span.badge-danger a').text()).toBe("5");

    // validate summary
    console.log(header.html())
    expect(header.exists('.available a[children=84]')).toBe(true); // commitee
    expect(header.exists('.available a[children=6]')).toBe(true); // special
    expect(header.exists('.ready a[children=2]')).toBe(true);
    expect(header.exists('.commented a[children=1]')).toBe(true);
    expect(header.exists('.missing a[children=19]')).toBe(true);

    // validate navidation
    expect(header.find('a#agenda').text()).toBe('Agenda');
    expect(header.find('a[children="Committee Reports"]').prop('href')).toBe('/Abdera');
    expect(header.find('a[children="Special Orders"]').prop('href')).toBe('/Change-Geronimo-Chair');
  });
});
