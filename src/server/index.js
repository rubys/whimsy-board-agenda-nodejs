import express from 'express';
import compression from 'compression';
import historicalComments from "./historical-comments.js";
import jira from "./jira.js";
import reporter from "./reporter.js";
import responses from "./responses.js";
import { port, buildPath } from './config.js';
import { agendas, read } from './svn.js';
import { parse } from './agenda.js';
import ldap from 'ldapjs';
import basicAuth from 'express-basic-auth';

const app = express();
app.use(compression());

app.use('/', express.static(buildPath, { index: false }));

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

app.get('/api/reporter', async (request, response) => {
  response.json(await reporter(request));
});

app.get('/api/responses', async (request, response) => {
  response.setHeader('content-type', 'application/json');
  response.send(await responses(request))  
});

app.listen(port, () => {
  console.log(`Whimsy board agenda app listening on port ${port}`);
});
