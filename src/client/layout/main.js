import Footer from "./footer.js";
import Header from "./header.js";
import React from "react";
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
  static view = React.createRef();

  // common layout for all pages: header, main, footer, and forms
  render() {
    if (!this.props.view) {
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
      <Header {...this.props}/>

      <main>{React.createElement( this.props.view, this.props)}</main>

      <Footer {...this.props} />

      {this.props.buttons ? this.props.buttons.map(button => {
        if (button.form) {
          return React.createElement(
            button.form,
            { item: this.props.item, key: button.text, button }
          )
        } else {
          return null
        }
      }) : null}
    </>
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

  // additional client side initialization
  componentDidMount() {
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
