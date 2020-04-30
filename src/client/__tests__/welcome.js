import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import store from '..//store';
import Router from '../router.js';

test('renders welcome splash screen', () => {
  const context = {};

  const { getByText } = render(<>
    <base href="/"/>
    <Provider store={store}>
      <StaticRouter location='/' context={context}>
        <Router />
      </StaticRouter>
    </Provider>
  </>);

  const progressIndicator = getByText(/Fetching board agenda/i);

  expect(progressIndicator).toBeInTheDocument();
});
