import Agenda from './client/models/agenda.js';
import * as Events from "./client/events.js";
import * as Actions from "./actions.js";
import JSONStorage from "./client/models/jsonstorage.js";
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import store from './client/store';
import ClientContainer from './client/container.js';

let base = window.location.pathname.match(/\/(\d\d\d\d-\d\d-\d\d\/)?/)[0];

document.getElementsByTagName('base')[0].href = base;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ClientContainer base={base} />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

(async () => {
  // load server information
  let server = await new Promise((resolve, reject) => {
    JSONStorage.fetch('../api/server', (error, response, final) => {
      if (error) {
        alert('unable to contact server');
        if (reject) reject(error);
      } else {
        if (response) store.dispatch(Actions.postServer(response));
        if (resolve) resolve(response);
        if (response && final) Events.monitor(response);
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
          Agenda.load(agenda);
        }

        resolve(agenda);
      })
    });

    // fetch and store minutes information
    JSONStorage.fetch(`minutes/${base.slice(1, -1)}.json`, (error, minutes) => {
      if (error) {
        throw error;
      } else if (minutes) {
        store.dispatch(Actions.postSecretaryMinutes(minutes));
      }
    })

    // start Service Worker
    // if (PageCache.enabled) PageCache.register(); TODO!
  }
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
