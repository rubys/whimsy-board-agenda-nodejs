import Keyboard from "./keyboard.js";
import React, { useEffect, useState } from "react";
import { connect } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Router from './router.js';
import Touch from "./touch.js";
import '../index.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "./react-logo.svg";
import "./App.css";
import './agenda.css';
import './demo/demo.css';

//
// Client specific processing: loading image, store provider,
// Browser router, css.

function mapStateToProps(state) {
  return {
    agenda: !!state.agenda?.Adjournment,
    user: !!state.server.user
  }
};

function Container({ agenda, user, base }) {
  let [showSpinner, setSpinner] = useState(false);

  // set waiting to be true if we are on an agenda page
  // and we don't yet have an agenda or user.
  let waiting = false;
  if (base !== '/' || window.location.pathname === '/') {
    if (!agenda || !user) {
      waiting = true;
    }
  };

  // delay showing spinner for 0.5 seconds to prevent flashing
  // when content can be served from the browser cache.
  useEffect(() => {
    if (waiting) setTimeout(() => setSpinner(true), 500);
  }, [waiting]);

  // start watching keystrokes and fingers
  useEffect(() => {
    Keyboard.initEventHandlers();
    Touch.initEventHandlers();
  }, []);

  if (waiting) {
    // show logo while waiting...
    return <div className="App">
      {showSpinner ?
	<header className="App-header">
	  <img src={logo} className="App-logo" alt="logo" />
	  <p>Fetching board agenda...</p>
	</header>
	: <></>}
    </div>
  }

  // route request based on path and query from the window location (URL)
  return <BrowserRouter basename={base}>
    <Router />
  </BrowserRouter>
}

export default connect(mapStateToProps)(Container)
