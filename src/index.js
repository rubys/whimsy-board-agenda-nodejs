import * as Actions from "./actions.js";
import JSONStorage from "./client/models/jsonstorage.js";
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
  let server = await new Promise((resolve, reject) => {
    JSONStorage.fetch('../api/server', (error, response) => {
      if (error) {
        alert('unable to contact server');
        if (reject) reject(error);
      } else {
        if (response) store.dispatch(Actions.postServer(response));
        if (resolve) resolve(response);
      };

      resolve = reject = null;
    })
  });

  if (base === '/') {
    // emulate the server side redirect to the latest agenda
    let latest = [...server.agendas].sort().pop();
    let date = latest.match(/\d+_\d+_\d+/)[0].replace(/_/g, "-");
    window.location.href = `/${date}/`;
  } else {
    // fetch and store agenda information
    await new Promise((resolve, reject) => {
      JSONStorage.fetch(`${base.slice(1, -1)}.json`, (error, agenda) => {
        if (error) {
          reject(error);
        } else if (agenda) {
          store.dispatch(Actions.postAgenda(agenda));
          resolve(agenda);
        }
      })
    });

    // fetch and store minutes information
    await new Promise((resolve, reject) => {
      JSONStorage.fetch(`minutes/${base.slice(1, -1)}.json`, (error, minutes) => {
        if (error) {
          reject(error);
        } else if (minutes) {
          store.dispatch(Actions.postSecretaryMinutes(minutes));
          resolve(minutes);
        }
      })
    });
  }
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
