## Quick Start

Pick from the following:

* [MacOS](./MACOSX.md)
* [Linux](./LINUX.md)
* [Windows](./WINDOWS.md)
* [Docker](./Dockerfile)

## Architecture

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

The client would post-process this information.  As an example, I add next and
prev links as well as hrefs.  This would be stored in a Redux store.
Individual React components could then subscribe to just the data they need,
and update themselves when this data changes.

Matt has seen a preview of this, but I've made a lot of progress since he tried
it.  With the current board agenda application, there is an undocumented and
not completely implemented feature where you press '=' and see the cache (it
actually used to work, but presumably it was broken in the React=>Vue port when
React was playing games with their license).  With the Node.js application,
this has been expanded.  You can directly see Redux store (i.e., data after the
client transformations). Going left and right you can see the cache, which will
contain the information prior to the client transformations, and another page
which will give you a list of links to request fresh data directly from the
server.

My goal is to make this very developer friendly and to have a shallow learning
curve.  You will be able to author YAML and then go to the server view to see
the raw (server-augmented) JSON.  You can go to the cache view to see the
parsed (server-augmented) JSON.  You can go to the store view and see the
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
be aware of all SVN commits.  Polling LDAP can also be done.

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

Other significant components:
 * [Bootstrap](https://getbootstrap.com/) styles
 * [Express](https://expressjs.com/) web framework
 * [jQuery](https://jquery.com/)
 * [Node.js](https://nodejs.org/en/docs/guides/)
 * [React Redux](https://react-redux.js.org/)
 * [React Router](https://reacttraining.com/react-router/)

Supporting cast:
 * [babel](https://babeljs.io/) javascript transpiler
 * [express-ws](https://www.npmjs.com/package/express-ws) websocket support
 * [jest](https://jestjs.io/) testing framework
 * [ldapjs](http://ldapjs.org/)
 * [webpack](https://webpack.js.org/)


