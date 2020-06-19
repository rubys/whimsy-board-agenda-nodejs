import React from 'react';
import Comments from '../comments.js';
import { mount } from 'enzyme';
import * as Agenda from '../../../server/sources/agenda.js';
import store from '../../store.js';
import * as Actions from '../../../actions.js';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

jest.mock('../../../server/svn.js');

it("should support comments", async () => {
    let agenda = await Agenda.read('board_agenda_2015_01_21.txt');
    store.dispatch(Actions.postAgenda(agenda));

    const comments = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Comments/>
        </Provider>
      </MemoryRouter>);
  
    // unseen items
    expect(comments.find("a.h4").at(10).text()).toBe("Curator");  
    expect(comments.find('pre').at(22).text()).toMatch(/last PMC member and committer additions/);

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