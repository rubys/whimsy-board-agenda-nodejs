import * as Actions from "./actions.js";
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Router from './client/router.js';
import * as serviceWorker from './serviceWorker';
import store from './client/store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

(async () => {
  let response = await fetch('/api/latest.json');
  let json = await response.json();
  console.log(Actions.postAgenda(json));
  store.dispatch(Actions.postAgenda(json));
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
