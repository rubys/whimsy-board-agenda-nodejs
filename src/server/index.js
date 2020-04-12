import express from 'express';
import compression from 'compression';
import historicalComments from "./sources/historical-comments.js";
import jira from "./sources/jira.js";
import postedReports from "./sources/posted-reports.js";
import reporter from "./sources/reporter.js";
import responses from "./sources/responses.js";
import * as websocket from "./websocket.js";
import { port, buildPath } from './config.js';
import { agendas, read } from './svn.js';
import { parse } from './sources/agenda.js';
import ldap from 'ldapjs';
import basicAuth from 'express-basic-auth';
import { digest } from './cache.js';
import * as watcher from './watcher.js';

const app = express();
app.use(compression());

app.use('/', express.static(buildPath, { index: false }));

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
  if (!watcher.active) {
    watcher.start(request);
  };

  next();
});

app.get('/api/session', async (request, response) => {
  response.json({ session: websocket.session });
});

app.get('/api/latest.json', async (request, response) => {
  response.json(await parse(await read((await agendas(request)).pop())));
});

app.get('/api/jira', async (request, response) => {
  response.json(await jira());
});

app.get('/api/historical-comments', async (request, response) => {
  response.setHeader('content-type', 'application/json');
  response.send(await historicalComments(request))  
});

app.get('/api/posted-reports', async (request, response) => {
  response.setHeader('content-type', 'application/json');
  response.send(await postedReports(request))  
});

app.get('/api/reporter', async (request, response) => {
  response.json(await reporter(request));
});

app.get('/api/responses', async (request, response) => {
  response.setHeader('content-type', 'application/json');
  response.send(await responses(request))  
});

app.get('/api/digest', async (request, response) => {
  response.json(await digest());
})

app.listen(port, () => {
  console.log(`Whimsy board agenda app listening on port ${port}`);
});
