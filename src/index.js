import * as Actions from "./actions.js";
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Router from './client/router.js';
import * as serviceWorker from './serviceWorker';
import store from './client/store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './client/agenda.css';

let base = window.location.pathname.match(/\/(\d\d\d\d-\d\d-\d\d\/)?/)[0];

document.getElementsByTagName('base')[0].href = base;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={base}>
        <Router />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

(async () => {
  // fetch and store server information
  let options = { credentials: "include" };
  let request = new Request("../api/server", options);
  let response = await fetch(request);
  let server = await response.json();
  store.dispatch(Actions.postServer(server));

  // fetch and store agenda information
  let latest = [...server.agendas].sort().pop();
  let date = latest.match(/\d+_\d+_\d+/)[0].replace(/_/g, "-");
  response = await fetch(`/api/${date}.json`);
  let agenda = await response.json();
  store.dispatch(Actions.postAgenda(agenda));
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
