import committeeInfo from "./sources/committee-info.js";
import historicalComments from "./sources/historical-comments.js";
import jira from "./sources/jira.js";
import minutes from "./sources/minutes.js";
import postedReports from "./sources/posted-reports.js";
import reporter from "./sources/reporter.js";
import responses from "./sources/responses.js";
import server from "./sources/server.js";
import * as websocket from "./websocket.js";
import * as ldap from "./ldap.js";
import { Board, Minutes } from './svn.js';
import { read } from './sources/agenda.js';
import { digest } from './cache.js';
import postData from "./operations/post-data.js";
import post from "./operations/post.js";

export default function router(app) {

  app.get('/api/session', async (request, response) => {
    response.json({ session: websocket.session });
  });

  app.get('/api/latest.json', async (request, response) => {
    response.json(await read((await Board.agendas(request)).pop()));
  });

  app.get('/api/:date([0-9]+-[0-9]+-[0-9]+).json', async (request, response, next) => {
    let agenda = `board_agenda_${request.params.date.replace(/-/g, '_')}.txt`;
    try {
      response.json(await read(agenda, request));
    } catch (error) {
      if (error.code === 'ENOENT') next();
      next(error);
    }
  });

  app.get('/api/:date([0-9]+-[0-9]+-[0-9]+).txt', async (request, response, next) => {
    let fileName = `board_minutes_${request.params.date.replace(/-/g, '_')}.txt`;
    let minutes;
    
    try {
      if ((await Board.draftMinutes()).includes(fileName)) {
        minutes = await Board.read(fileName);
      } else {
        minutes = await Minutes.read(fileName);
      }

      response.setHeader('content-type', 'text/plain');
      response.send(minutes);
    } catch (error) {
      if (error.code === 'ENOENT') next();
      next(error);
    }
  });

  app.get('/api/committers', async (request, response) => {
    let members = await ldap.members();
    let committers = Object.entries(await ldap.names()).map (([name, id]) => (
      { name, id, member: members.includes(id) }
    ));
    response.json(committers);
  });

  app.get('/api/committee-info', async (request, response) => {
    response.json(await committeeInfo(request));
  });

  app.get('/api/jira', async (request, response) => {
    response.json(await jira());
  });

  app.get('/api/historical-comments', async (request, response) => {
    response.setHeader('content-type', 'application/json');
    response.send(await historicalComments(request))
  });

  app.get('/api/minutes/:date([0-9]+-[0-9]+-[0-9]+)', async (request, response, next) => {
    response.json(await minutes(request, request.params.date));
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

  app.get('/api/server', async (request, response) => {
    response.json(await server(request));
  });

  app.get('/api/digest', async (request, response) => {
    response.json(await digest());
  });


  app.post('/api/post', async (request, response) => {
    response.json(await post(request));
  });

  app.post('/api/post-data', async (request, response) => {
    response.json(await postData(request));
  });

}