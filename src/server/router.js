import * as websocket from "./websocket.js";
import * as ldap from "./ldap.js";
import * as secretaryMinutes from "./sources/minutes.js";
import reminderText from './sources/reminder-text.js';
import { Board, Minutes } from './svn.js';
import { read } from './sources/agenda.js';
import { promises as fs } from "fs";
import * as cache from "./cache.js";
import yaml from 'yaml';

export default async function router(app) {

  if (process.env.NODE_ENV === 'development') {
    app.get('/api/websocket', (request, response) => {
      response.json(websocket.debug_status());
    })
  }

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

      response.setHeader('Content-Type', 'text/plain');
      response.send(minutes);
    } catch (error) {
      if (error.code === 'ENOENT') next();
      next(error);
    }
  });

  app.get('/api/minutes/:date([0-9]+-[0-9]+-[0-9]+).json', async (request, response, next) => {
    let agenda = `board_agenda_${request.params.date.replace(/-/g, '_')}.txt`;

    try {
      let minutes = await secretaryMinutes.read(agenda, request);
      response.json(minutes);
    } catch (error) {
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

  app.get('/api/cache/:file', async (request, response, next) => {
    let json = await cache.read(`${request.params.file}.json`);
    if (json) {
      response.setHeader('Content-Type', 'application/json');
      response.send(json);
    } else {
      let data = await cache.read(`${request.params.file}.yaml`);
      if (data) {
        response.json(yaml.parse(data));
      } else {
        next(); // 404
      }
    }
  });

  app.get('/api/:reminder(reminder[12]|non-responsive)', async (request, response, next) => {
    try {
      response.json(await reminderText(request));
    } catch (error) {
      next(error)
    }
  });

  // define a route for HTTP GET requests for each file in the sources
  // directory.
  for (let file of await fs.readdir(`${__dirname}/sources`)) {
    if (!file.endsWith(".js")) continue;
    let path = `/api/${file.split('.')[0]}`
    let callback = (await import(`./sources/${file}`)).default;
    if (!callback) continue;

    app.get(path, async (request, response, next) => {
      try {
        let content = await callback(request);

        if (typeof content === 'object') {
          response.json(content);
        } else {
          response.setHeader('Content-Type', 'application/json');
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
    let path = `/api/${file.split('.')[0]}`;
    let callback = (await import(`./operations/${file}`)).default;

    app.post(path, async (request, response, next) => {
      try {
        let content = await callback(request);

        if (typeof content === 'object') {
          response.json(content);
        } else {
          response.setHeader('Content-Type', 'application/json');
          response.send(content.toString());
        }
      } catch (error) {
        next(error)
      }
    })
  }
}
