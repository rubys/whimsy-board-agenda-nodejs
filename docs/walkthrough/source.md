# Source Tree

A brief description of what files are place where.

## build

This directory will be created in production and will
contain static HTML, images, stylesheets and bundled
JavaScript.

## [docs](../../docs)

This contains walk-throughs (like this one!) in Markdown
format.

## node_modules

This is where `yarn` installs modules

## [package.json](../../package.json)

Yarn contains a description for
[package.json](https://classic.yarnpkg.com/en/docs/package-json/),
but in reality many tools look to this file for configuration.
Examples include [eslint](https://eslint.org/docs/user-guide/configuring),
[babel](https://github.com/browserslist/browserslist),
[create react app](https://create-react-app.dev/docs/proxying-api-requests-in-development/), and even
[node.js](https://nodejs.org/api/esm.html#esm_package_json_type_field) itself.

## [public](../../public)

This is where static files are found for development.

## [scripts](../../scripts)

Scripts listed in `package.json` need to be portable across operating systems.
Implementing such scripts in a portable way, using node.js, makes then
available to all operating systems.

## [src](../../src)

All executable code and tests can be found in this directory.

### [src/client](../../src/client)

This is code that runs in the browser

### [src/client/\_\_tests\_\_](../../src/client/__tests__)

Test cases for client functionality.

### [src/client/buttons](../../src/client/buttons)

React components that represent buttons.  For buttons that
launch modal dialogs, the associated form is contained in
the same file.

### [src/client/demo](../../src/client/demo)

This contains the React/Redux/JSX demo.

### [src/client/elements](../../src/client/elements)

Grab bag location for all React components that are not
buttons, layout, pages, or part of the demo.

### [src/client/layout](../../src/client/layout)

Contains the `Main`, `Header`, and `Footer` components.

### [src/cleint/models](../../src/cleint/models)

This is the prior "object oriented" implementation that is
being migrated to a Redux store.  Some of it is still
operational as scaffolding during the migration.  Other
parts (e.g., events, jsonstorage, pagecache) are likely
to continue on.

### [src/client/pages](../../src/client/pages)

This contains React components that are intended to fill
the entire "main" pane in the three-pane design.

### [src/client/reducers](../../src/client/reducers)

This contains the [reducers](https://redux.js.org/basics/reducers/)
that populate the Redux store.

### [src/client/agenda.css](../../src/client/agenda.css)

Contains the bulk of the application specific style definitions.

### [src/client/deepMerge.js](../../src/client/deepMerge.js)

Utility function used by reducers to minimize
changes.

### [src/client/keyboard.js](../../src/client/keyboard.js)

Keystroke event handler

### [src/client/router.js](../../src/client/router.js)

Determines what page to display based on the URL.

### [src/client/store.js](../../src/client/store.js)

The Redux store.

### [src/client/touch.js](../../src/client/touch.js)

Emulation of things like swipe events for touch interfaces
like cell phones.

### [src/client/utils.js](../../src/client/utils.js)

A place for reuseable code.  Also contains the legacy
Server structure that should be replaced with the redux store.

## [src/server](../../src/server)

The Node.js server

### [src/server/\_\_mocks\_\_](../../src/server/__mocks__)

Replacement implementations used for testing purposes.

### [src/server/\_\_tests\_\_](../../src/server/__tests__)

Server side tests

### [src/server/operations](../../src/server/operations)

Code that handles HTTP POST requests

### [src/server/sources](../../src/server/sources)

Code that handles HTTP GET requesst.

Notable:

* [agenda.js](../../src/server/operations/agenda.js) contains
the agenda parser.  Individual sections are handled by code
in a [companion subdirectory]((../../src/server/operations/agenda).
* [devproxy.js](../../src/server/operations/devproxy.js)
forwards requests to the whimsy.apache.org server.  This
enabled development servers to show such things as the
number of responses to feedback sent out by the secretary
without having a local board mailing list archive.

### [src/server/templates](../../src/server/templates)

Templates for resolutions, etc.  Perhaps this should
move to private/foundation/board/templates?

### [src/server/cache.js](../../src/server/cache.js)

Manages reading and writing files in work/cache.

### [src/server/config.js](../../src/server/config.js)

Server configuration: directory locations, port number.

### [src/server/credentials.js](../../src/server/credentials.js)

Parses basic authentication headers.

### [src/server/express.js](../../src/server/express.js)

The [express](https://expressjs.com/) server code.
Handles authentication.

### [src/server/ldap.js](../../src/server/ldap.js)

Encapsulation of the LDAP queries used by this application.

### [src/server/router.js](../../src/server/router.js)

Routes HTTP requests.

### [src/server/string-utils.js](../../src/server/string-utils.js)

A place for reusable string functions.

### [src/server/svn.js](../../src/server/svn.js)

Encapsulates access to svn repositories

### [src/server/watcher.js](../../src/server/watcher.js)

Contains file system watchers, as well as the development
WebSocket connection to the whimsy.apache.org server.

### [src/server/websocket.js](../../src/server/websocket.js)

Manages browser client websocket connections.

## [src/actions.js](../../src/actions.js)

Redux [actions](https://redux.js.org/basics/actions/)

## [src/index.js](../../src/index.js)

Entry point for the client browser application.  It was
placed here by [Create React App](https://reactjs.org/docs/create-a-new-react-app.html#create-react-app)
... and I am scared to move it.  :-)

## [src/server.js](../../src/server.js)

Entry point for the server application.

# work

This is where `agenda`, `cache`, `repos` and `svn` files
will be placed by the running application.  It can be
blown away at any time.

