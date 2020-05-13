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

The key players in this scenario:

  * [keyboard.js](../../src/client/keyboard.js) dispatches a `clockIncrement`
    action, followed by a HTTP POST to `/api/refresh`, followed by a
    `clockDecrement` action once the response is received.
  * [clock-counter.js](../../src/client/reducers/clock-counter/js) updates
    the state in response to clock increment and decrement actions.
  * [header.js](../../src/client/layout/header.js) renders an hourglass
    when the `clockCounter` from the Redux store has a positive value.
  * [refresh.js](../../src/server/operations/refresh.js) invokes the svn
    update operation and returns an updated agenda.

What follows is a description of the number of small steps required to
pull this off.

## Client

Synopsis: The board agenda HTML page includes a script that defines a keyboard
event handler that dispatches multiple actions to update the 
[Redux store](https://redux.js.org).
[React Components](https://reactjs.org/docs/react-component.html)
subscribe to updates to the store and rerender the portions of the
DOM that they are responsible for.  The DOM is only updated if the
values being rendered in it are impacted by the change.

### [index.html](../../public/index.html)

This is the HTML page that is sent for all pages, as the rendering is
done on the client.  In production, server side rendering will likely
be used to speed up the initial display.  This will also avoid the
splash screen you see of a rotating atom.

### [index.js](../../src/index.js)

This is the entrypoint for the JavaScript.  It sets the document
[base](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base) URL,
initializes the [store](https://redux.js.org/) and
[router](https://reacttraining.com/react-router/) and then
renders the router for this application.  Once that is complete, it fetches
`/api/server` and the parsed agenda page and loads the data it receives as
responses into the store.

### [router.js](../../src/client/router.js)

This controls which page is rendered, based on the URL.

Generally what this does is render [`<Main>`](../../src/client/layout/main.js)
with properties (a.k.a. HTML attributes) that indicate such things as
which view to render and which agenda item to render within that view.

[`<Main>`](../../src/client/layout/main.js) also renders
[`<Header>`](../../src/client/layout/header.js) and
[`<Footer>`](../../src/client/layout/footer.js).  Header is what renders the clock.
If you like, you can skip ahead to the [header](#header) step in this walkthrough.

What's important for this scenario is the
[componentDidMount](https://reactjs.org/docs/react-component.html#componentdidmount)
method which initializes the keyboard event handler.

### [keyboard.js](../../src/client/keyboard.js)

This defines an
[onkeydown](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onkeydown)
event handler to process keystrokes.

When 
[keyCode](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode)
 `82` is encountered, a total of three actions are dispatched,
one immediately after the keypress is encountered, and two in response to the
response to the HTTP POST request that is sent.

Note: `keyCode` is deprecated, but necessary to support IE.  Once we decide to drop
support for IE, we should move to 
[KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code).

#### [actions.js](../../src/actions.js)

This file defines all of the possible
[Actions](https://redux.js.org/basics/actions/)
that can be performed on the store.  Actions are JavaScript objects with a `type`
property and the data needed to complete this action.

#### [store.js](../../src/client/store.js)

This file calls [createStore](https://redux.js.org/api/createstore/)
with the result of the call to
[combineReducers](https://redux.js.org/api/combinereducers/).
The store handles dispatching of actions and subscriptions to
changes.

#### [clock-counter.js](../../src/client/reducers/clock-counter.js)

This is the [reducer](https://redux.js.org/basics/reducers) 
that handles the `CLOCK_INCREMENT` and `CLOCK_DECREMENT` actions.

#### [utils.js](../../src/client/utils.js)

This contains the definition of a `post` function.  It was originally
defined using
[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
as that is what browsers supported at the time, but as this point should be
modernized to use
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

<a name="header"></a>
### [header.js](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

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

## Server

Synopsis: POST requets are handled by JavaScript modules found in the
`src/server/operations` directory.

#### [server.js](../../src/server.js)

Verifies that the version of Node being used is 12 or higher, configures
[Babel](https://babeljs.io/) for Node.js and React, logs unhandled promise
rejections, and invokes express.

### [express.js](../../src/server/express.js)

Defines an [Express](https://expressjs.com/) application.  Sets up compression,
automatic parsing of POST request bodies,
handling of static content (HTML, CSS, JavaScript), starts a websocket,
implements LDAP authentication for all non-static content, starts a file system
watcher, invokes the application router, and listens on the configured port.

### [router.js](./../src/server/router.js)

This sets up handlers for HTTP GET and POST requests.  Most notably for this
scenario, a route is established for every file in the `src/server/operations`
directory to handle a POST request to `/api/` followed by the basename of the
file.

#### [refresh.js](../../src/server/operations/refresh.js)

This calls `svn.Board.update` to perform the `svn update` of the
`private/foundation/board` working copy.  A time-to-live value of 0
ensures that this is always performed no matter how recently it had
been performed before.

`agenda.read` is then called and passed the value of the `agenda`
found in the request.body.  The results are returned to the router,
which will serialize it as JSON and send the response.

In development mode, refresh will also reset all "forked" repositories.

### [svn.js](../../src/server/svn.js)

This will perform the svn operations using
[child_process.spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options).

### [agenda.js](../../src/server/agenda.js)

This parses the agenda using a bunch of gnarly regular expressions.