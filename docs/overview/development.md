# Development

The board agenda tool provides a number of developer tools
to assist with development.  You can get to the list of
tools by pressing <code>D</code> on an agenda page.

Before proceeding, it may be helpful to run through the Demo
that can be found in the documentation linked to from the
Developer page.

# Isolating problems

Given the way the application is structured, the following
approach works > 80% of the time.

If what is being presented in the browser does not match
expectations, the first place to look at is in the store
using the development tool mentioned above.  If the data
in the store is correct, the problem is in the
[page](../../src/client/pages),
[element](../../src/client/elements), or
[button](../../src/client/buttons) that renders the view.

If the store is incorrect, generally the store is populated
with data from the server.  Look at the client cache of
server responses using the Cache developer tool.  If that
data is correct, the problem is in the
[reducer](../../src/client/reducers).

If the server responses are incorrect, often that data is
aggregated from a number of sources.  Look at the server cache
to see if that data is correct.  If that data is correct,
the problem is generally in one of the
[sources](../src/server/sources).

If server cached data is incorrect, the problem lies in
what generates it.  For example,
[ldap.js](../../src/server/ldap.js).

This process also works well in reverse.  If you want to add
a new feature, you can work to ensure that the data makes its
way successfully from the server to the relevant React
component(s), and verify via inspection the data at every step
of the way.

In the much less than 20% of the cases where the above doesn't
suffice, [test first](http://www.extremeprogramming.org/rules/testfirst.html)
development is often an effective way forward.

# Edit, compile, debug

While there are compile steps, the system is set up to make
compilation entirely transparent.  In most cases, you make a change
and see the results.  You don't even have to refresh the browser
window - that is done automatically for you.

Note: you don't have to use a particular IDE or tool to make
the edits.  A file system watcher will pick up the change and
deploy it.

The agenda pages are not the only ones that will be updated
automatically.  The store and cache developer tools are also
live views and will automatically update as data changes.

Following is how this works, based on content type.

## stylesheets

Webpack's [Hot Module Replacement](https://webpack.js.org/guides/hot-module-replacement/#hmr-with-stylesheets)
will pick up changes to stylesheets and apply the changes
immediately.

## client code

Webpack's [Hot Module Replacement](https://webpack.js.org/guides/hot-module-replacement/) works with modules too.

## server code

The server is started with
[nodemon](https://www.npmjs.com/package/nodemon) which will
restart the server if any server source files change.  Restarting
the server will close any open websockets.  When the websocket is
reestablished, the client will be
[told to refresh the window](./websocket.md#startup--authentication).
This will cause data to be refetched.

Additionally, there is code in [nodemon.js](../../nodemon.js)
to flush portions of the cache if source files that are
responsible for the generation of that data are changed.
This list is currently incomplete, additions are welcome.

## data

If you modify files in the `work` directory, that will likely
trigger actions that send notification to the browser clients,
which in turn may cause data to be re-fetched.  This currently
is a work in progress, and will likely mature rapidly.

# Testing

Running tests is done via:

    yarn test

This runs tests in parallel (using one process per core), and the tool
will remain up once the tests complete.  As you make changes to
the source, the affected tests will automatically rerun.

Tests generally are place in `__test__` directories alongside
of the code they test.

The test framework is [jest](https://jestjs.io/) which has ample
documentation.  You can do everything from launching servers to
launching browsers (via [puppeteer](https://jestjs.io/docs/en/puppeteer)).
But generally you don't need all that to test a module or
component.

Some highlights:

## server

Server code is organized into
[ECMAScript modules](https://nodejs.org/api/esm.html).
Such code interfaces to the external world through `imports`
and `exports`.

Jest provides the ability to
[mock](https://jestjs.io/docs/en/manual-mocks) imports.

[src/server/\_\_tests\_\_/post.js](../../src/server/__tests__/post.js#L1)
tests posting a new item to the agenda.  The attachment number
that would be generated would depend on the agenda.  Actually
doing this live would have the unfortunate side effect of
modifying the data in subversion.

This test, however, mocks the calls to subversion out, and
replaces them with
[code that reads test data](../../src/server/__mocks__/svn.js),
and keeps data that is intended to be written in memory instead
of writing it to disk.

Mocking is opt-in on a test case basis.  Other tests can
test svn functionality, perhaps on local repositories created
with
[svnadmin](http://svnbook.red-bean.com/en/1.7/svn.ref.svnadmin.html).

## client

Things like reducers can be tested with similar techniques.
Generally, there is no need to for mocks to test a reducer
as a reducer is strictly a function with no side effects.

More interesting is the testing of React components.  You
generally don't need a browser or even a full DOM implementation
to test a component.

[src/client/\_\_tests\_\_/cve.js](../../src/client/__tests__/cve.js)
tests the hotlinking of CVEs using
[enzyme](https://enzymejs.github.io/enzyme/docs/guides/jest.html).

There are other test renderers available.  And you can even use
a full [jsdom](https://github.com/jsdom/jsdom) implementation if
needed.

# Package management

[yarn add](https://yarnpkg.com/en/docs/cli/add/) is used
to add a new dependency,
[yarn remove](https://yarnpkg.com/en/docs/cli/remove/) is
used to remove a dependency.

[yarn outdated](https://yarnpkg.com/en/docs/cli/outdated/) will
check for packages that need to be updated, and
[yarn upgrade](https://yarnpkg.com/en/docs/cli/upgrade/) will
upgrade dependencies.  Running `yarn upgrade` with no parameters
will upgrade all dependencies.

Once done, commit the updated `yarn.lock` file.

When pulling the latest code from git, run `yarn install`
if the `yarn.lock` file changed.
