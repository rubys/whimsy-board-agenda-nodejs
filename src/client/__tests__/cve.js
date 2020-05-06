import React from 'react';
import { mount } from 'enzyme';
import store from '../store';
import { Provider } from 'react-redux';
import Report from '../pages/report.js';

it('renders welcome message', () => {
  let item = {title: 'PMC', text: 'we fixed CVE-2020-0001 this month'}

  const output = mount(
    <Provider store={store}>
      <Report item={item}/>
    </Provider>
  );

  let text = output.find('Text span').props().dangerouslySetInnerHTML.__html;

  expect(text).toContain("<a href='https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-0001'>CVE-2020-0001</a>")
});
