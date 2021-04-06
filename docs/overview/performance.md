# Preface

There are two versions of the board agenda tool, the one used today is written
in Ruby.  There is a second one in development written in JavaScript.  The
below focuses primarily on the JavaScript version, but much of it applies to
both.  In a few cases, explicit references are made to the Ruby version as
indications of directions the JavaScript version could take in the future, but
hasn't been implemented yet.

For best results, start a server locally and navigate to the Developer tools
by pressing the letter 'D'.  Doing so will enable you to explore the data
further.

Navigating from the Developer tools to the Documentation/Guides and then
running  the React/Redux demo will provide some helpful background.

# Memory Footprint

A lot of the speed of the board agenda tool is due to the fact that it
literally is possible to load all of the code and all of the data needed to
render every page in memory.  As rendering can all be done on the client, this
means that everything including [page transitions](https://reactrouter.com/)
can be achieved without any server interaction.

Breaking this down...

## Data

Open a few tabs and [browsers will use gigabytes of
memory](https://www.tomsguide.com/news/chrome-firefox-edge-ram-comparison#chrome-vs-firefox-vs-edge-ram-usage-results-xa0).

The bulk of the data the agenda tool uses comes from
[agendas](http://apache.org/foundation/records/minutes/2020/), which typically
require only a few hundred kilobytes.  Even when you add in additional data
from places like
[committee-info.txt](https://svn.apache.org/repos/private/committers/board/committee-info.txt)
and LDAP, the total data needed to render **all** of the pages is on the order
of the size of a largish image file.

From the Developer tools page, you can navigate to the **Store** and explore
the data that is available to render pages.

## Code

React components generally consist of functions that return a JSX template.
In the board agenda application there are on the order of one hundred source
files in
[src/client](https://github.com/rubys/whimsy-board-agenda-nodejs/tree/master/src/client),
again totalling hundreds of kilobytes *uncompressed*.  In production, this
code can be run through [terser](https://terser.org/), reducing this
considerably.

If you run `yarn build` in the directory where you checked out the board
agenda code you will see the resultant file sizes.  The largest chunk is the
React library itself.

# Caching

Caching is done both server side and client side.  Caching on the server side
benefits first time visitors and enables the server to support more
simultaneous users.  Caching on the client side makes subsequent visits start
up faster, including the creation of new tabs.

The standard HTTP mechanisms of returning a [304 Not
Modified](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304)
response when possible and gzipping responses when appropriate are
implemented, but play a minor role.

From the development tool page, you can navigate to the **Cache** page and
explore both the server and client caches.

## Reconciliation

One of the primary benefits of React is that it only updates what it needs to.
If you have used the board agenda tool before, undoubtedly you have seen cases
where either the secretary has recorded some minutes or somebody has made a
change to svn and within seconds this update is reflected in your browser
window.  When this occurs, React isn't refreshing the entire page, but rather
inserting, replacing, and deleting only what is needed in the DOM to make what
you see match the JSX that a React component has returned.  This process is
called [reconciliation](https://reactjs.org/docs/reconciliation.html).

When coupled with a client side cache, this can make startup happen virtually
instantly.  Before the client requests the latest data from the server and
displays the response the client can proceed to render the pages using data
from its cache and then updating the results once data is received from the
server.

You may have seen cases where you have navigated to the main agenda page and
before you select where you are going the colors of a few pages are updated.
This is what is happening.

The benefits of React's reconciliation are not limited to data changes.  At
development time, code can change.  When it does, Webpack can deploy the
changes, and React will then proceed to call the new code with the current
state and reconcile the DOM with the result.  To see this in action, use the
agenda tool to navigate to a report, and click on the add comment button.
Enter a comment but don't click save.  Using your favorite editor, edit
`src/client/buttons/add-comment.js`.  Search for `label="item requires
discussion or follow up"` and change the word requires to uppercase.  Save
your change and see your browser window update without losing any state.

## Service Workers

Implemented only in the Ruby version so far, but [Service
Workers](https://developers.google.com/web/fundamentals/primers/service-workers/)
represent code that runs in the browser that can intercept and respond to
requests intended for the server.  This is useful for offline operations.

This can also speed up startup.  The whimsy board agenda tool is deployed on a
VM and execution processes are managed by [Phusion
Passenger](https://www.phusionpassenger.com/).  Passenger will spin down
instances when idle and this may mean that your access requires a cold start
of the server.  Instead of waiting for the HTML page and JavaScript code to be
fetched (often with a 304 Not Modified response), the client can proceed with
the data it already has in cache.  In rare cases where the JavaScript code
that is later returned turns out to be different, a full page refresh is done.
