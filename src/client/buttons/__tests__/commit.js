import Commit from '../commit.js';
import * as Agenda from '../../../server/sources/agenda.js';
import store from '../../store';
import * as Actions from '../../../actions.js';
import { Provider } from 'react-redux';
import React from 'react';
import { render } from '@testing-library/react';
import jQuery from "jquery";

jest.mock('../../../server/svn.js');

describe('post form', () => {
  it('should perform a reflow', async () => {
    // load server state, including some pending actions
    store.dispatch(Actions.postServer({
      pending: { approved: ['7'], unapproved: [], flagged: [], unflagged: [], comments: { I: 'Nice report!' } },
      user: { userid: 'rubys' }
    }));

    // load agenda
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));

    // render the Commit form (initially hidden)
    render(<>
      <Provider store={store}>
        <Commit/>
      </Provider>
    </>);

    // trigger show event
    jQuery("#commit-form").trigger("show.bs.modal");

    // validate initial state: long lines and a danger reflow button
    expect(document.getElementsByTagName('textarea')[0].value)
      .toBe(['Approve W3C Relations', 'Comment on BookKeeper'].join("\n"));
  })
});