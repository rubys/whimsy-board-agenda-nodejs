import express from 'express';
import compression from 'compression';
import * as websocket from "./websocket.js";
import { port, srcPath, buildPath } from './config.js';
import ldap from 'ldapjs';
import basicAuth from 'express-basic-auth';
import * as watcher from './watcher.js';
import router from './router.js';
import bodyParser from 'body-parser';
import { promises as fs } from "fs";
import path from 'path';
import { Board } from './svn.js';
import ssr from './ssr.js';

const app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', express.static(buildPath, { index: false }));

app.get(/\/src\/([-\w/]+\.\w+)/, async (request, response, next) => {
  try {
    let path = request.params[0];
    let script = await fs.readFile(`${srcPath}/${path}`, 'utf8');
    let types = {js: 'text/javascript'};
    response.setHeader('Content-Type', types[path.split('.').pop()] || 'text/plain');
    response.send(script.toString());
  } catch (error) {
    next(error.code === 'ENOENT' ? undefined : error)
  }
});

websocket.start(app);

app.use(basicAuth({
  challenge: true,
  realm: 'ASF Board Agenda tool',
  authorizeAsync: true,
  authorizer: (username, password, callback) => {
    let client = ldap.createClient({
      url: 'ldaps://ldap-us-ro.apache.org:636',
      tlsOptions: { rejectUnauthorized: false }
    });

    let dn = `uid=${username},ou=people,dc=apache,dc=org`;
    client.bind(dn, password, (error) => {
      callback(null, !error);
      client.destroy();
    });
  }
}));

app.use('/', (request, response, next) => {
  if (!watcher.active) watcher.start(request);
  next();
});

(async () => {
  await router(app);

  if (process.env.NODE_ENV === 'test') {
    const svn = await import('./svn.js');
    await svn.demoMode();
  } else {
    // route '/' to latest agenda
    app.get('/', async (request, response) => {
      let agenda = (await Board.agendas(request)).pop();
      let date = agenda.match(/\d\w+/)[0].replace(/_/g, '-');
      response.redirect(`/${date}/`);
    });

    // serve application pages
    app.get(/^\/\d{4}-\d\d-\d\d\/.*$/, (req, res) => {
      // TODO: replace with SSR
      res.sendFile(path.join(__dirname, '../../build', 'index.html'));
    });
  }

  app.get('/*', async (req, res) => {
    await ssr(req, res);
  });

  app.listen(port, () => {
    console.log(`Whimsy board agenda app listening on port ${port}`);
  })
})();

