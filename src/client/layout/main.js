import Footer from "./footer.js";
import Header from "./header.js";
import NotFound from "./not-found.js";
import React, { useEffect } from "react";
import jQuery from "jquery";

//
// Main component, responsible for:
//
//  * Initial loading and polling of the agenda
//
//  * Rendering a Header, a item view, and a Footer
//
//  * Resizing view to leave room for the Header and Footer
//
function Main(props) {
  // additional client side initialization
  useEffect(() => {
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

    // scroll to top
    Main.scrollTo = 0;
    window.onresize();
  }, []);

  // after each rendering, resize main window
  useEffect(() => {
    window.onresize()
  });

  // common layout for all pages: header, main, footer, and forms
  if (!props.view) return <NotFound location={props.location}/>;

  return <>
    <Header {...props} />

    <main>{React.createElement(props.view, props)}</main>

    <Footer {...props} />

    {props.buttons ? props.buttons.map(button => {
      if (button.form && !button.type) {
        return React.createElement(
          button.form,
          { item: props.item, key: button.text, button }
        )
      } else {
        return null
      }
    }) : null}
  </>
};

// navigation method that updates history (back button) information
Main.navigate = function (path, query) {
  let history = window.history;
  history.state.scrollY = window.scrollY;
  history.replaceState(history.state, null, history.path);
  Main.scrollTo = 0;
  history.pushState({ path, query }, null, path);
  window.onresize();
  if (path) Main.latest = false
};

export default Main
