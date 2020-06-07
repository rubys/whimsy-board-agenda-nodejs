import React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import store from '../store';
import Router from '../router.js';
import TestRenderer from 'react-test-renderer';

test('renders welcome splash screen', () => {
  const context = {};

  let root = TestRenderer.create(<>
    <Provider store={store}>
      <StaticRouter location='/' context={context}>
        <Router />
      </StaticRouter>
    </Provider>
  </>).root;

  expect(root.findByType('p').children[0]).toBe("Fetching board agenda...");
});
