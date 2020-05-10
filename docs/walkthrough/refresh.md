# Refreshing the agenda

Pressing `R` when viewing the agenda or a report will _refresh_ the
local Subversion working copy of the `private/foundation/board` directory,
reparse the agenda if it changed, and update the page you are viewing
with the latest content.  Under normal operation, this is generally not
needed as the server is notified of changes to Subversion and automatically
refreshes.

While the server operation is ongoing, an hourglass appears in the top
center of the header, and it disappears when the operation completes.

If you press `=` you go to a page that shows the client
[Redux](https://redux.js.org/) store which contains all of the information
needed to render all of the views in the application.

If you press `R` when viewing this page, in addition to seeing the hourglass
appear and disappear, you will see `clockCounter` increment to one and, a
few seconds later, return to zero.

What follows is a description of the number of small steps required to
pull this off.

## Client

### [index.html](./public/index.html)

This is the HTML page that is sent for all pages, as the rendering is
done on the client.  In production, server side rendering will likely
be used to speed up the initial display (and avoid the splash screen
you see of a rotating atom).

### [index.js](./src/index.js)

This is the entrypoint for the JavaScript.  It sets the document
[base](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base) URL,
initializes the [store](https://redux.js.org/) and
[router](https://reacttraining.com/react-router/) and then
renders the router for this application.  Once that is complete, it fetches
`/api/server` and the parsed agenda page and loads that data into the store.

### (router.js)[./src/client/router.js]

This controls which page is rendered, based on the URL.

Generally what this does is render [<Main>](./src/client/layout/main.js)
with properties (a.k.a. HTML attributes) that indicate such things as
which view to render and which agenda item to render within that view.

[<Main>](./src/client/layout/main.js) also renders
[<Header>](./src/client/layout/header.js)
[<Footer>](./src/client/layout/footer.js).  Header is what renders the clock.

What's important for this scenario is the
[componentDidMount](https://reactjs.org/docs/react-component.html#componentdidmount)
which initializes the keyboard event handlers.

### (keyboard.js)[./src/client/keyboard.js]

This defines a
[onkeydown](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onkeydown)
event handler to process keystrokes.

When keyCode `82` is encountered, three total actions are dispatched,
one immediately after the keypress is encountered, and two in response to the
response to the HTTP POST request that is sent.

#### (actions.js)[./src/actions.js]

This file defined all of the possible
[Actions](https://redux.js.org/basics/actions/)
that can be performed on the store.

#### (store.js)[./src/client/store.js]

This file calls [createStore](https://redux.js.org/api/createstore/)
with the result of the call to
[combineReducers](https://redux.js.org/api/combinereducers/).

#### (clock-counter.js)[./src/client/reducers/clock-counter.js]

This is the _reducer_ that handles the `CLOCK_INCREMENT` and
`CLOCK_DECREMENT` actions.

#### (utils.js)[./src/client/utils.js]

This contains the definition of a `post` function.  It was originally
defined using
[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
as that is what browsers supported at the time, but it should be modernized
to use
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

<a name="header"></>
### (header.js)[https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API]

For the purposes of this walkthrough, the `Header` component does three
things:

1. It calls [connect](https://react-redux.js.org/api/connect) to tell the
   Redux store what `mapStateToProps` function to use for this component.

2. [mapStateToProps](https://react-redux.js.org/api/connect#mapstatetoprops-state-ownprops-object)
   associates the `clockCounter` property with `state.clockCounter`,
   effectively creating a subscription.  The entire Header will be rerendered
   any time any property changes.

3. The `render` method uses a
   [conditional (ternary) operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)
   to only render a `<span>` element containing an
   [hourglass](https://www.fileformat.info/info/unicode/char/231b/index.htm)
   character if `this.props.clockCounter > 0`.




