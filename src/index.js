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

  if (base === '/' && server.env === 'development') {
    // emulate the server side redirect to the latest agenda
    let latest = [...server.agendas].sort().pop();
    let date = latest.match(/\d+_\d+_\d+/)[0].replace(/_/g, "-");
    window.location.href = `/${date}/`;
  } else {
    // fetch and store agenda information
    response = await fetch(`/api/${base.slice(1, -1)}.json`);
    if (response.ok) {
      let agenda = await response.json();
      let date = new Date(agenda[0].timestamp).toISOString().slice(0, 10);
      store.dispatch(Actions.postAgenda(agenda));
      store.dispatch(Actions.meetingDate(date));
    } else {
      console.error(`fetch agenda ${base}: ${response.statusText}`);
    }
  }
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
