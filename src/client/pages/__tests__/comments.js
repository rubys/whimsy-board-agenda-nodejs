import React from 'react';
import Comments from '../comments.js';
import { render } from '@testing-library/react';
import * as Agenda from '../../../server/sources/agenda.js';
import store from '../../store.js';
import * as Actions from '../../../actions.js';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

jest.mock('../../../server/svn.js');

it("should support comments", async () => {
    let agenda = await Agenda.read('board_agenda_2015_01_21.txt');
    store.dispatch(Actions.postAgenda(agenda));

    let container = document.createElement('div');

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Comments/>
        </Provider>
      </MemoryRouter>,
      { container }
    );
  
    // unseen items
    expect(container.querySelectorAll("a.h4")[10].textContent).toBe("Curator");  
    expect(container.querySelectorAll('pre')[22].textContent).toMatch(/last PMC member and committer additions/);

    /*
  
    // seen items
    expect(comments).not_to(have_selector("h4 a", {text: "ACE"}));
  
    expect(comments).not_to(have_selector(
      "pre",
      {text: /Reminder email sent/}
    ));
  
    // footer
    expect(comments).to(have_selector("button", {text: "mark seen"}));
    expect(comments).to(have_selector("button", {text: "show seen"}));

    */
  })
