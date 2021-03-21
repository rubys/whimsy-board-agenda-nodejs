import Post from '../post.js';
import * as Agenda from '../../../server/sources/agenda.js';
import store from '../../store';
import * as Actions from '../../../actions.js';
import { Provider } from 'react-redux';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import jQuery from "jquery";

jest.mock('../../../server/svn.js');

jest.mock('../../utils.js', () => ({
  ...jest.requireActual('../../utils.js'),
  retrieve: jest.fn(),
}));

describe('post form', () => {
  it('should perform a reflow', async () => {
    // load server state
    store.dispatch(Actions.postServer({
      pending: { comments: [], approved: [], unapproved: [], flagged: [], unflagged: [] },
      user: { userid: 'rubys' }
    }));

    // load agenda, select EVP report
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));
    let item = store.getState().agenda['Executive-Vice-President'];

    // render the Post form (initially hidden)
    render(<>
      <Provider store={store}>
        <Post item={item} button={{ text: 'post report' }} />
      </Provider>
    </>);

    // trigger show event
    jQuery("#post-report-form").trigger("show.bs.modal");

    // validate initial state: long lines and a danger reflow button
    expect(document.getElementsByTagName('textarea')[0].value)
      .toMatch(/to answer\nquestions/);
    expect([...screen.getByText('Reflow').classList])
      .toContain('btn-danger');

    // Request a reflow
    fireEvent.click(screen.getByText('Reflow'));

    // validate final state: shorter lines and a default reflow button
    expect(document.getElementsByTagName('textarea')[0].value)
      .toMatch(/to\nanswer questions/);
    expect([...screen.getByText('Reflow').classList])
      .toContain('btn-default');
  })
});
