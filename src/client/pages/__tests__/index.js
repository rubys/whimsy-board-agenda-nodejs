import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import store from '../../store.js';
import { Provider } from 'react-redux';
import Index from '../index.js';
import * as Agenda from '../../../server/sources/agenda.js';
import * as Actions from '../../../actions.js';

jest.mock('../../../server/svn.js');

describe('index page', () => {
  it('should show an index page', async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    const index = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Index />
        </Provider>
      </MemoryRouter>
    );

    // rows with colors and titles
    expect(index.exists('tr.missing td a[children="Abdera"]')).toBe(true);
    expect(index.exists('tr.reviewed td a[children="Buildr"]')).toBe(true);
    expect(index.exists('tr.reviewed td a[children="Celix"]')).toBe(true);
    expect(index.exists('tr.commented td a[children="Lenya"]')).toBe(true);

    // attach, owner, shepherd columns
    expect(index.exists('tr.reviewed td[children="CF"]')).toBe(true);
    expect(index.exists('tr.reviewed td[children="Mark Cox"]')).toBe(true);
    expect(index.exists('tr.missing td a[children="Sam"]')).toBe(true);
    expect(index.find('tr').at(10).find('td').at(1).text()).toBe('Executive Assistant');
    expect(index.find('tr').at(10).find('td').at(3).text()).toBe('Ross');

    // links, flagged and unflagged
    expect(index.find('a[children="Abdera"]').prop('href')).toBe('/flagged/Abdera');
    expect(index.find('a[children="ACE"]').prop('href')).toBe('/ACE');
  });
});
