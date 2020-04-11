import Agenda from "../models/agenda.js";
import Events from "../models/events.js";
import Footer from "./footer.js";
import Header from "./header.js";
import Keyboard from "../keyboard.js";
import Minutes from "../models/minutes.js";
import PageCache from "../models/pagecache.js";
import Pending from "../models/pending.js";
import React from "react";
import Reporter from "../models/reporter.js";
import Router from "../router.js";
import Touch from "../touch.js";
import { Server } from "../utils.js";
import { jQuery } from "jquery";
import logo from "../react-logo.svg";
import "../App.css";

//
// Main component, responsible for:
//
//  * Initial loading and polling of the agenda
//
//  * Rendering a Header, a item view, and a Footer
//
//  * Resizing view to leave room for the Header and Footer
//
class Main extends React.Component {
  // dummy exported refresh method (replaced on client side)
  static refresh() { };

  static view = React.createRef();

  // common layout for all pages: header, main, footer, and forms
  render() {
    if (!this.props.item) {
      if (this.props.server) {
        return <p>Page not found</p>
      } else {
        return <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>Fetching board agenda...</p>
          </header>
        </div>
      }
    };

    return <>
      <Header item={this.props.item} />

      <main>{Agenda.index[0] && Agenda.index[0].text ? React.createElement(
        this.props.item.view,
        { item: this.props.item, ref: Main.view }
      ) : null}</main>

      <Footer item={this.props.item} buttons={this.props.buttons} options={this.props.options} />

      {this.props.buttons ? this.props.buttons.map((button) => {
        if (button.form) {
          return React.createElement(
            button.form,
            { item: this.props.item, server: Server, key: button.form.name, button }
          )
        } else {
          return null
        }
      }) : null}
    </>
  };

  // initial load of the agenda, and route first request
  created() {
    // copy server info for later use
    for (let [prop, value] of Object.entries(this.props.server)) {
      Server[prop] = value
    };

    if (PageCache.enabled || !Server.userid) Pending.fetch();
    Agenda.load(this.props.page.parsed, this.props.page.digest);
    Minutes.load(this.props.page.minutes);
    if (PageCache.enabled) Reporter.fetch();
    this.route(this.props.page.path, this.props.page.query);

    // free memory
    this.props.page.parsed = null
  };

  // encapsulate calls to the router
  route = (path, query) => {
    let route = Router.route(path, query);

    this.setState({
      item: route.item,
      buttons: route.buttons,
      options: route.options
    });

    if (!Main.item || !route.item || Main.item.view !== route.item.view) {
      Main.view = null
    };

    Main.item = route.item;

    // update title to match the item title whenever page changes
    if (typeof document !== 'undefined' && route.item) {
      document.getElementsByTagName("title")[0].textContent = route.item.title
    }
  };

  // navigation method that updates history (back button) information
  navigate = (path, query) => {
    let history = window.history;
    history.state.scrollY = window.scrollY;
    history.replaceState(history.state, null, history.path);
    Main.scrollTo = 0;
    // this.route(path, query);
    history.pushState({ path, query }, null, path);
    window.onresize();
    if (path) Main.latest = false
  };

  // refresh the current page
  refresh() {
    this.route(window.history.state.path, window.history.state.query)
  };

  // additional client side initialization
  componentDidMount() {
    // export navigate and refresh methods as well as view
    Main.navigate = this.navigate;
    Main.refresh = this.refresh;
    Main.item = Agenda;

    // start watching keystrokes and fingers
    Keyboard.initEventHandlers();
    Touch.initEventHandlers();

    // whenever the window is resized, adjust margins of the main area to
    // avoid overlapping the header and footer areas
    window.onresize = () => {
      let main = document.querySelector("main");
      if (!main) return;
      let footer = document.querySelector("footer");
      let header = document.querySelector("header");

      if (window.innerHeight <= 400 && document.body.scrollHeight > window.innerHeight) {
        if (footer) footer.style.position = "relative";
        if (header) header.style.position = "relative";
        main.style.marginTop = 0;
        main.style.marginBottom = 0
      } else {
        if (footer) footer.style.position = "fixed";
        if (header) header.style.position = "fixed";
        main.style.marginTop = `${document.querySelector("header.navbar").clientHeight}px`;
        main.style.marginBottom = `${document.querySelector("footer.navbar").clientHeight}px`
      };

      if (Main.scrollTo === 0 || Main.scrollTo) {
        if (Main.scrollTo === -1) {
          jQuery("html, body").animate(
            { scrollTop: document.documentElement.scrollHeight },
            "fast"
          )
        } else {
          window.scrollTo(0, Main.scrollTo);
          Main.scrollTo = null
        }
      }
    };

    // do an initial resize
    Main.scrollTo = 0;
    window.onresize();

    // if agenda is stale, fetch immediately; otherwise save etag
    if (this.props.page) {
      Agenda.fetch(this.props.page.etag, this.props.page.digest);
    }

    // start Service Worker
    // if (PageCache.enabled) PageCache.register(); TODO!

    // start backchannel
    Events.monitor();
  };

  componentDidUpdate() {
    window.onresize()
  }

  // after each subsequent re-rendering, resize main window
  updated() {
    window.onresize()
  }
};

export default Main
