# WebSockets

WebSockets are used to asynchornously inform browsers of changes that
may affect what is being displayed.

In fact, the current design point is outside the initial handshake limit the
use of WebSockets between browsers and servers to be one way communications
(server -> browser) of smallish JavaScript objects, serialized as JSON.

## Startup / Authentication

WebSockets support encryption (WebSocket Secure or WSS), but not authentication.
This means that authentication must be obtained by other means.

The board agenda tool accomplishes this via requiring clients to obtain
a "session token" via an authenticated HTTP Get request and then send
that token as a header once the websocket is opened.

With the current (Ruby) based webserver, you can see that token in
[server.json](https://whimsy.apache.org/board/agenda/server.json) as
`session`.  With the Node.js version running in development mode, the same
data is placed in [/api/server](http://localhost:3000/api/server).

[src/server/websocket.js](../../src/server/websocket.js) maintains
the list of current connections with three separate
[Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), `authorized`, 'sessions`, and `users`.

One side effect of this: if the server ever is restarted (something that
happens often in development, but will also happen when new software is
deployed in production), all web sockets will be closed.  The client has
logic to retry opening a web socket until successful.  At the point it is
successful, it will have a session token that is not recognized.

The server takes this opportunity to send a message to the client telling it
to `reload`.  If the client is not currently displaying a page with a visible
input or textarea, the client will reload the page, getting updated
scripts, images, and data.

## Sharing WebSockets between Tabs

Two factors contribute to the design contraint of limiting the use of
WebSockets to one way smallish messages.

  1. Browsers place a 
     [limit of on the number of simultaneoous open connections](https://stackoverflow.com/a/985704).
     Effectively, the limit these days is six.  And that is per browser, not
     per tab.  Some people like to haev multiple open tabs with different
     agenda items in them, and they hit this limit pretty fast.

  2. Modern browsers support a
     [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
     interface for Request/Response object pairs.  This makes it easy to
     cache responses from HTTP GET.

There are a number of ways to address these limitions.  One is to have only
one WebSocket and to send the data between tabs.

[Sending data across different browser tabs](https://blog.arnellebalane.com/sending-data-across-different-browser-tabs-6225daac93ec)
 is a blog post providing a good overview of the available options..

Unfortunately, the best option,
[Broadcast ChannelAPI](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
isn't supported by Safari.

Nor is [SharedWorker API](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker).

Fortunately, [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is supported everywhere.

Unfortunately, this is limited to 5 to 10 Mb, total.

It should be possible to live within those limits (a full board agenda is less
than a megabyte), but it seems unwise to push it.  Limiting oneself to passing
digests around and having each tab request the data using HTTP GET is
a better approach.  [HTTP 304](https://httpstatuses.com/304) responses and
local caches are very effective.

The current implementation where tabs identify a master which broadcasts
websocket messages received to other tabs is contained in
[src/client/models/events.js](../..src/client/models/events.js).  It is
moderately complicated, but at this point largely debugged in that the
same code is used in the Ruby based Board Agenda tool.

Potential alternatives for the future:

1) Service workers have the ability to
   [post messages to clients](https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage).
   There are other reasons to have a service worker, and even Safari now
   supports Service workers.

2) The number of connections limitation is actually a HTTP 1.1 limitation.
   This can be solved by moving to HTTP 2.  In fact, it should be possible
   to eliminate the need for WebSockets entirely with HTTP2.
    
## Server API

Now that we have established that that role of WebSockets on the server
is limiting to send small JSON objects, the interface is simple.

The [src/server/websocket.js](../../src/server/websocket.js) exports
a `broadcat(message)` function.  The only real constraint is that the
message is expected to have a `type` property used in routing.

If the message also has a `private` property, the value of that property
will limit the distribution to only clients which are associated with
the user named by this property.  This isn't so much for security, but
rather to ensure that pending comments made by Sam Ruby don't show up
in Shane Curcuru's queue, and vice versa.

## Client routing

This is still work in progress, but the `dispatch` function can be found in
[src/client/models/events.js](../../src/client/models/events.js).

It currently handles `reload`, `digest`, and will merily forward on
any actions defined in [src/actions.js](../../src/actions.js) to the
Redux store.

## Development websocket

In addition to the websocket between the Node.js server and browsers,
the Node.js server will establish a websocket connection with the
board agenda tool hosted on whimsy.apache.org.  That tool will see the
websocket connection as if it were a browser.

This code is in
[src/server/watcher.js](../src/server/watcher.js).

At the moment, it merely re-broadcasts all messages (the Ruby board agenda
tool has the same convention for `private` messages).

Additionally, for messages with `type="agenda"`, it will initiate a
`svn update` of the `private/foundation/board` directory.
