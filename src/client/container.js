import Keyboard from "./keyboard.js";
import React, { useEffect } from "react";
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

  // start watching keystrokes and fingers
  useEffect(() => {
    Keyboard.initEventHandlers();
    Touch.initEventHandlers();
  }, []);

  if (base !== '/' || window.location.pathname === '/') {
    if (!agenda || !user) {
      // show logo while waiting...
      return <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Fetching board agenda...</p>
        </header>
      </div>
    }
  }

  // route request based on path and query from the window location (URL)
  return <BrowserRouter basename={base}>
    <Router />
  </BrowserRouter>
}

export default connect(mapStateToProps)(Container)
