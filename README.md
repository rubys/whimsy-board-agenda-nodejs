[![Build Status](https://travis-ci.org/rubys/whimsy-board-agenda-nodejs.svg)](https://travis-ci.org/rubys/whimsy-board-agenda-nodejs)

## Quick Start

To run this, pick from the following:

* [Docker](./docker-compose.yml)
* [MacOS](./MACOSX.md)
* [Linux](./LINUX.md)
* [Windows](./WINDOWS.md)

Updating to the latest can be done as follows:

    git pull; yarn install; yarn dev

The (currently modest, but growing) test suite can be run via:

    yarn test

## Architecture

The server is in [src/server.js](src/server.js), with the application logic
starting in [src/server/router.js](src/server/router.js).  In development
mode, the server  stores its files in a `work` directory, and this contains
things like svn checkouts and caches.  In production this likely will be placed
in `/srv`.  At any time, you can blow away the `work` directory (even while the
server is running) and it will promptly be repopulated with fresh data.

In development mode, the client starts in [./src/index.js](src/index.js), again
with the main line application logic starting in
[./src/client/router.js](src/client/router.js).  In production, the startup
entry point is likely going to be different, and will make use of
[server side rendering](https://reactjs.org/docs/react-dom-server.html).

Client [reducers](./src/client/reducers/) (slight misnomer here, but that's what
Redux calls them) maintain a [Redux](https://react-redux.js.org/) store based
on [actions](./src/actions.js) that are
[dispatched](https://redux.js.org/api/store#dispatchaction).  Individual React
components (e.g. [pages](./src/client/pages) and
[buttons](./src/client/buttons) then subscribe to just the data they need, and
update themselves when this data changes.

## Developer tools, demo, and documentation

Once you launch the agenda, pressing "D" will bring you to a page where you
can access developer tools, documentation, and from there, a demo.

The [walk-throughs](.docs/walkthrough) are also available via GitHub.
