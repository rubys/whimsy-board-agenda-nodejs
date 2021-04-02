import React from 'react';
import Search from '../search.js';
import * as Agenda from '../../../server/sources/agenda.js';
import store from '../../store.js';
import * as Actions from '../../../actions.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

jest.mock('../../../server/svn.js');

describe('search', () => {
  it("should search for text in reports", async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    let container = document.createElement('div');

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Search query='?q=ruby'/>
        </Provider>
      </MemoryRouter>,
      { container }
    );

    expect(container.querySelector('pre').innerHTML).toContain('Sam <span class="hilite">Ruby</span>');
    expect(container.querySelectorAll('h4 a')[3].textContent).toBe("Qpid");
  })
})
