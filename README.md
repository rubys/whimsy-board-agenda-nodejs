## Quick Start

Pick from the following:

* [MacOS](./MACOSX.md)
* [Linux](./LINUX.md)
* [Windows](./WINDOWS.md)
* [Docker](./Dockerfile)

## Architecture

The server is in [src/server.js](src/server.js), with the application logic
starting in [src/server/router.js](./src/server/router.js].  In development
mode, the server  stores its files in a `work` directory, and this contains
things like svn checkouts and caches.  In production this likely will be placed
in `/srv`.  At any time, you can blow away the `work` directory (even while the
server is running) and it will promptly be repopulated with fresh data.

In development mode, the client starts in [./src/index.js](src/index.js), again
with the main line application logic starting in
[./src/client/router.js](src/client/router.js).  In production, the startup
entry point is likely going to be different, and will make use of
[server side rendering](https://reactjs.org/docs/react-dom-server.html).

## Data Flow

The current board agenda tool (implemented in Ruby) attacks the text file with
regular expressions and custom logic.  In the new (Node.js/React.js)
implementation, The regular expressions would be replaced by a YAML parser.
One or more directories would be no problem, we can parse each file and build
an array of the results.

The custom logic would remain only if it adds value.  For example, the "call to
order" YAML file in svn could list avail IDs, and the parsing logic on the
server could add the associated public names and information like whether or
not the individual is an ASF member and possibly what PMCs they chair (if any).
PMCs ids could also be mapped to display names as a number of PMCs have aliases
(hc => HttpComponents), and add other relevant information like who the
chair(s) is/are and where to send emails.

The resulting code would be much smaller, and much easier to maintain/extend.

This data would be sent down to the client in JSON format.

The client would post-process this information.  As an example, client
*reducers* (slight misnomer here, but that's what Redux calls them) add next and
prev links as well as hrefs.  This would be stored in a Redux store.
Individual React components could then subscribe to just the data they need,
and update themselves when this data changes.

With the current board agenda application, there is an undocumented and not
completely implemented feature where you press '=' and see the cache (it
actually used to work, but presumably it was broken in the React=>Vue port when
React was playing games with their license).  With the Node.js application,
this has been expanded.  You can directly see Redux store (i.e., data after the
client transformations). Going left and right you can see the cache, which will
contain the information prior to the client transformations, and another page
which will give you a list of links to request fresh data directly from the
server.

The goal is to make this very developer friendly tool and to have a shallow
learning curve.  You will be able to author YAML and then go to the server view
to see the raw (server-augmented) JSON.  You can go to the cache view to see
the parsed (server-augmented) JSON.  You can go to the store view and see the
resulting object module after the client [reducers](./src/client/reducers) have
been run against this data.  The object module views will be live and update
dynamically as information changes.

This works today.  If you have previously gotten this Node.js board agenda tool
up and running, you can update to the latest with the following three commands:
`git pull`; `yarn install`; `yarn dev`.  If you haven't gotten it up and
running yet, what are you waiting for? 

In this architecture, a React component in its simplest form is a template that
attaches itself to one or more places in the Redux store... as the store change
the template is re-rendered and the browser window is updated with the results.
This is essentially a pub/sub architecture.

To make pub/sub work, updates to the data structure has to go through a
`store.dispatch` function.  You create [actions](src/actions.js) which are
small objects and pass them to the store which passes them to a reducer and
then notifies the subscribers of the change.  A reducer is what does the client
side transformation I describe above.

Generally, there are two things that create actions in this architecture:

* If the rendered HTML contains things like buttons, `onClick` actions may be
associated with methds that gather up some data, do a HTML post, and call
`store.dispatch` with an action based on this response.  Note that in this
architecture, the event handler doesn't have to worry about transforming the
data or determining what needs to be updated.  All it has to do is dispatch an
action.

* Each browser client establishes a websocket connection.
[server/websocket.js](src/server/websocket.js) exports a `broadcast` function
that will send a message to all clients.  Upon receipt of a message, a client
may chose to dispatch an action directly, decide to issue a HTTP GET request
and dispatch an action with the response, or ignore the message.  An example of
a data flow: any time an agenda changes, my plan is to send a message with a
MD5 digest of the data to all clients.  If the client is interested in that
particular agenda, it will fetch it and dispatch the results. 

Note that in the (hopefully near) future, the server will hook into
[PyPubSub](https://infra.apache.org/pypubsub.html) so that it will immediately
be aware of all SVN commits and LDAP changes.

## Sidebar: equality

An important part of the architecture is that [reducers](./src/client/reducers)
and `mapStateToProps` funnctions must take care to ensure that the objects
don't change something actually changed, and more importantly that the objects
do change when something changes.  Equality is defined by shallow equals.

Consider:

    let a = { type: "counter", value: 1 };
    let b = a;
    b.value++;

The problem here is that `b` still strictly equals `a`.  Both refer to the
underlying data structure, and while that data structure did change, the
references did not.  Now let's look at a different implementation:

    let a = { type: "counter", value: 1 };
    let b = { ...a, a.value + 1 };

This uses the vintage 2018 JavaScript [spread
syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
to create a new object, copying all of the properties of the original object,
and overriding a single value.

With this approach, `a` and `b` are truly different.

[src/client/deepMerge.js](./src/client/deepMerge.js) helps by eliminating
unnecessary differences.

## Current status

While the above is aspirational, the current status isn't quite there yet.
The previous/current board agenda tool was built using a custom object model,
router, and event model.  Much of that is still in place as the code is
transitioning to the new architecture. 

In general, invoking methods on models and React components outside of
a given source file is an indication that the code needs to be updated.
Components should only depend on `this.props` and `this.state`.

The test
[test](https://github.com/apache/whimsy/tree/master/www/board/agenda/spec) and
[data](https://github.com/apache/whimsy/tree/master/www/board/agenda/test) has
not been ported over yet.  At the moment, there are only a [few client
tests](https://github.com/rubys/whimsy-board-agenda-nodejs/tree/master/src/client/__tests__),
but they demonstrate a unit test and testing what would be displayed in a
browser.

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

Significant components:
 * [Bootstrap](https://getbootstrap.com/) styles
 * [Express](https://expressjs.com/) web framework
 * [Node.js](https://nodejs.org/en/docs/guides/) - [tutorial](https://nodejs.dev/)
 * [React](https://reactjs.org/) - [tutorial](https://reactjs.org/tutorial/tutorial.html)
 * [React Redux](https://react-redux.js.org/)
 * [React Router](https://reacttraining.com/react-router/)

Supporting cast:
 * [babel](https://babeljs.io/) javascript transpiler
 * [express-ws](https://www.npmjs.com/package/express-ws) websocket support
 * [jest](https://jestjs.io/) testing framework
 * [jQuery](https://jquery.com/)
 * [ldapjs](http://ldapjs.org/)
 * [webpack](https://webpack.js.org/)
 * [yarn](https://yarnpkg.com/)
