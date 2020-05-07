import * as websocket from "./websocket.js";
import * as ldap from "./ldap.js";
import { Board, Minutes } from './svn.js';
import { read } from './sources/agenda.js';
import { promises as fs } from "fs";

export default async function router(app) {

  app.get('/api/session', async (request, response) => {
    response.json({ session: websocket.session });
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
    let committers = Object.entries(await ldap.names()).map(([name, id]) => (
      { name, id, member: members.includes(id) }
    ));
    response.json(committers);
  });

  // define a route for HTTP GET requests for each file in the sources
  // directory.
  for (let file of await fs.readdir(`${__dirname}/sources`)) {
    if (!file.endsWith(".js")) continue;
    let path = `/api/${file.split('.')[0]}`
    let callback = (await import(`./sources/${file}`)).default;

    app.get(path, async (request, response, next) => {
      try {
        let content = await callback(request);

        if (typeof content === 'object') {
          response.json(content);
        } else {
          response.setHeader('content-type', 'application/json');
          response.send(content.toString());
        }
      } catch (error) {
        next(error)
      }
    })
  }

  // define a route for HTTP POST requests for each file in the operations
  // directory.
  for (let file of await fs.readdir(`${__dirname}/operations`)) {
    if (!file.endsWith(".js")) continue;
    let path = `/api/${file.split('.')[0]}`
    let callback = (await import(`./operations/${file}`)).default;

    app.put(path, async (request, response, next) => {
      try {
        let content = await callback(request);

        if (typeof content === 'object') {
          response.json(content);
        } else {
          response.setHeader('content-type', 'application/json');
          response.send(content.toString());
        }
      } catch (error) {
        next(error)
      }
    })
  }
}
