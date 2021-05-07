import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
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

    let container = document.createElement('div');

    let { getByText, getAllByText } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Index />
        </Provider>
      </MemoryRouter>,
      { container }
    );

    // rows with colors and titles
    expect(getByText('Abdera').closest('tr')).toHaveClass('missing');
    expect(getByText('Buildr').closest('tr')).toHaveClass('reviewed');
    expect(getByText('Celix').closest('tr')).toHaveClass('reviewed');
    expect(getByText('Lenya').closest('tr')).toHaveClass('commented');

    // attach, owner, shepherd columns
    expect(getByText('CF').closest('tr')).toHaveClass('reviewed');
    expect(getByText('Mark Cox').closest('tr')).toHaveClass('reviewed');
    expect(getAllByText('Sam')[4].closest('tr')).toHaveClass('missing');
    expect(container.querySelectorAll('tr')[10]
      .querySelectorAll('td')[1].textContent).toBe('Executive Assistant');
    expect(container.querySelectorAll('tr')[10]
      .querySelectorAll('td')[3].textContent).toBe('Ross');

    // links, flagged and unflagged
    expect(getByText('Abdera')).toHaveAttribute('href', '/flagged/Abdera');
    expect(getByText('ACE')).toHaveAttribute('href', '/ACE');

    // change chair resolution - chair name
    expect(getByText('Change Geronimo Chair').closest('tr')
      .querySelectorAll('td')[2].textContent).toBe('Alan Cabrera');
  });
});
