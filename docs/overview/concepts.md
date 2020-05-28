# Concepts

While [sources](./sources.md) contains a detailed catalog of the various source
files and directories, this page contains a high level overview.

It may be helpful to run the provided Demo before reading this, and then
consulting one or more walk-throughs afterwards.

## [Sources](../../src/server/sources/)

Sources are reponsible for converting data from external sources (Subversion,
JIRA, mailing list archives) into JSON and provide the results in response to
HTTP GET requests.  In most cases, this is a single request which returns, for
example, all of the information in
[committee-info.txt](https://svn.apache.org/repos/private/committers/board/committee-info.txt)
or all of the draft reports being prepared at
[reporter.apache.org](https://reporter.apachee.org/).

In other cases, information is per meeting, and individual
[routes](../../src/server/router.js) are provided for each.

From the board agenda tool, pressing `D` will get you to the list of developer
tools, and from there you can get to a page that provides a clickable list of
all of the server requests available.

# [JSONStorage](../../src/client/models/jsonstorage.js)

Responses to HTTP GET requests are cached on the client and parsed as JSON
upon request.  Because the tool is set up to dynamically update the
presentation as new data arrives, caching makes start-up fast even in
development.  This is because JSONStorage will typically provide two
reponses to every request - one with potentially stale data enabling the
page to be rendered quickly, and then once again once data is received from
the server.

There is a developer tool provided for viewing this cache.

# [Actions](../../src/actions.js) and [Reducers](../../src/client/reducers/)

A [Redux store](https://redux.js.org/api/store) contains the whole state tree
for the application.  Actions are the only way to modify state.  Reducers
combine and reshape data.
[React components](https://reactjs.org/docs/components-and-props.html)
can [connect](https://react-redux.js.org/api/connect) to the store and
thereby automatically be rerendered when the data they subscribe to changes.

There is a developer tool provided for viewing the state of the Redux store.

# [Layout](../../src/client/layout/), [Pages](../../src/client/pages/), and [Elements](../../src/client/elements/)

These directories contain the main presentation elements which are responsible
for rendering data from the Redux store using
[JSX](https://reactjs.org/docs/introducing-jsx.html) templates.

 * Layout contains components common to all pages:
   [main](../../src/client/layout/main.js),
   [header](../../src/client/layout/header.js),
   [footer](../../src/client/layout/footer.js).
* Pages contain components that are intended to fill the entire center pane of
  the window.  The most important page is
  [report](../../src/client/pages/report.js).
* Elements contain elements that are shared between pages.  For example the
  *missing* and *shepherd* pages display a list of reports that meet different
  selection criteria.
  [additional-info](../../src/client/elements/additional-info.js) contains the
  common code shared between these components.

There is no developer view for these components, the templates are rendered
by navigating to the associated page.  If you need help determining which
source file is associated with which route, consult
[router.js](../../src/client/router.js).

# [Buttons](../../src/client/buttons/)

Buttons typically appear in the footer of the window, but can appear within the
main window pane.

Buttons can be standalone (e.g.,
[approve](../../src/client/buttons/approve.js) or
[attend](../../src/client/buttons/attend.js)) or can contain an associated
modal dialog (e.g.,
[comment](../../src/client/buttons/comment.js) or
[commit](../../src/client/buttons/commit.js))).  If a button contains an
associated modal dialog, the template and event handlers for that form
are contained in the same source file.

Pressing buttons typically will result in HTTP POST requests being sent
to the server, and the responses will be dispatches to the Redux store.

# [Operations](../../src/server/operations/)

Operations are
[asyncronous functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) that are invoked when the server
receives a POST request.  Data provided on the POST request is made available in
`request.body`.  Values returned by the function are serialized as JSON and
sent as the response.