import React from 'react';
import Search from '../search.js';
import * as Agenda from '../../../server/sources/agenda.js';
import store from '../../store.js';
import * as Actions from '../../../actions.js';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

jest.mock('../../../server/svn.js');

describe('search', () => {
  it("should search for text in reports", async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    const search = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Search query='?q=ruby'/>
        </Provider>
      </MemoryRouter>);

    expect(search.find('pre').at(0).html()).toContain('Sam <span class="hilite">Ruby</span>');
    expect(search.find('h4 a').at(3).text()).toBe("Qpid");
  })
})