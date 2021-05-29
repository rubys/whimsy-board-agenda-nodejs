import React from 'react';
import { Provider } from 'react-redux';
import store from '../store';
import ClientContainer from '../container.js';
import TestRenderer, { act } from 'react-test-renderer';

test('renders welcome splash screen after a delay', () => {
  jest.useFakeTimers();

  let root = TestRenderer.create(<>
    <Provider store={store}>
      <ClientContainer/>
    </Provider>
  </>).root;

  expect(root.findAllByType('p')).toHaveLength(0);

  act((() => {
    jest.advanceTimersByTime(1000);
  }));

  expect(root.findByType('p').children[0]).toBe("Fetching board agenda...");
});
