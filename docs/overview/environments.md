# Runtime Environments

Execution can occur in three different modes: `development`, `test`, and `production`.  This is controlled by setting the `NODE_ENV` environment variable
before starting the server.  This mode is sent to the client in response to a get
for `/api/server`, and is stored in the Redux store as `server.env`.

## Development

On the server side, two web servers are run, one on port `3000`, and a second one
on port `3001`.

A [Webpack Dev Server](https://webpack.js.org/configuration/dev-server/) is run
on port `3000`.  It is responsible for bundling your assets (scripts, images,
and HTML) and 
[Hot Module Replacment](https://webpack.js.org/concepts/hot-module-replacement/)
when source code changes while the application is running.

An [Express.js](https://expressjs.com/) server is run on port `3001` and
processes `GET` and `POST` requests to an `/api` endpoint.  Key differeences
from production:

  * Some sources (like board mailing list archves for the past 12 months) are
    not presumed to be available on your development machine.  In such cases,
    requests for this data are forwarded to `whimsy.apache.org`, and the
    responses to the forwarded requests are provided back to the client.

  * While checkouts and updates are initially done against production
    Subversion repositories, attempts to commit changes cause a local svn
    repository to be created with a snapshot of the content of the repository
    and further updates are done from the local repository until the
    repository is reset (generally using the Reset button that will appear
    at the bottom of the agenda index).

From the client side, there are a few differences:

  * Startup is entirely dynamic, and a splash screen involving rotating
    Atom is shown during the delay until server data is provided.  The
    server side HTTP redirect to the latest agenda page that occurs in
    production is replaced with navigation to the page which causes the
    entire page to blink.

  * The Help page will show how to get to the development tools when
    run in development mode.

## Test

While testing can involve launching of web servers intended to only process one
request, and headless web browsers, in most cases this isn't necessary.

Source code is organized into
[modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules),
and modules can generally be independenly tested using
[mock](https://jestjs.io/docs/en/manual-mocks) implementations, including
test data.

## Production

*Note*: production is not currently implemented.  Below describes the intended
direction.

In production, a single web server is run.  Before the web server is started,
`yarn build` is run to convert the sources into a minified bundle.

Attempts to fetch the base board agenda page will be redirected to the latest
agenda, and
[Server Side Rendering](https://reactjs.org/docs/react-dom-server.html)
(ofte referred to as SSR) will speed up initial load time. 