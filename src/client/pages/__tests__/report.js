import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import store from '../../store.js';
import { Provider } from 'react-redux';
import Report from '../report.js';
import * as Agenda from '../../../server/sources/agenda.js';
import * as Actions from '../../../actions.js';
import * as utils from '../../utils.js';

jest.mock('../../../server/svn.js');
utils.retrieve = jest.fn();

describe('filters', () => {
  it('converts mentions of CVEs to hotlinks', () => {
    let item = {
      title: 'PMC',
      text: 'we fixed CVE-2020-0001 this month',
      status: {}
    }

    let container = document.createElement('div');

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Report item={item} />
        </Provider>
      </MemoryRouter>,
      { container }
    );

    let text = container.querySelector('pre.report').innerHTML;

    expect(text).toContain('<a href="https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-0001">CVE-2020-0001</a>')
  });

  it('converts http addresses to links', async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));
    let item = store.getState().agenda.Clerezza;

    let container = document.createElement('div');

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Report item={item} />
        </Provider>
      </MemoryRouter>,
      { container }
    );

    let text = container.querySelector('pre.report').innerHTML;

    expect(text).toContain('<a href="http://s.apache.org/EjO">');
  });

  it('converts start time to local time on call to order', async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));
    let item = store.getState().agenda['Call-to-order'];

    let container = document.createElement('div');

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Report item={item} />
        </Provider>
      </MemoryRouter>,
      { container }
    );

    let text = container.querySelector('pre.report').innerHTML;

    expect(text).toContain('<span class="hilite">Local Time: ');
  });


  it('link people to roster info in roll call', async () => {
    let agenda = await Agenda.read('board_agenda_2015_02_18.txt');
    store.dispatch(Actions.postAgenda(agenda));
    let item = store.getState().agenda['Roll-Call'];

    let container = document.createElement('div');

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Report item={item} />
        </Provider>
      </MemoryRouter>,
      { container }
    );

    let text = container.querySelector('pre.report').innerHTML;

    expect(text).toContain('<a href="/roster/committer/rubys">');
    expect(text).toContain('<b>Sam Ruby</b>');
    expect(text).toContain('<a href="/roster/committer/?q=Unknown Name">');
    expect(text).toContain('<span class="commented">Unknown Name</span>');
  });
});
