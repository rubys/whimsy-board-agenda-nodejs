import React from 'react';
import { Provider } from 'react-redux';
import store from '../store';
import ClientContainer from '../container.js';
import TestRenderer from 'react-test-renderer';

test('renders welcome splash screen', () => {
  let root = TestRenderer.create(<>
    <Provider store={store}>
      <ClientContainer/>
    </Provider>
  </>).root;

  expect(root.findByType('p').children[0]).toBe("Fetching board agenda...");
});
