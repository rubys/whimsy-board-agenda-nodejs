import watch from 'node-watch';
import https from 'https';
import deepEqual from 'deep-equal';
import credentials from './credentials.js';
import { workPath } from './config.js';
import { broadcast } from './websocket.js';
import { read } from './sources/agenda.js';
import { promises as fs } from 'fs';
import WebSocket from 'faye-websocket';

export let active = false;

let fswatch = null;
let lastMessage = {};

export async function start(request) {
  // watch the work file system
  if (!fswatch || fswatch.isClosed()) {
    await fs.mkdir(workPath, { recursive: true });

    fswatch = watch(workPath, { recursive: true }, (eventType, fileName) => {
      if (fileName.startsWith(workPath + '/')) fileName = fileName.slice(workPath.length + 1);

      if (fileName.startsWith('svn/foundation_board/')) {
        let file = fileName.split('/').pop();
        if (eventType === 'update' && /^board_agenda_\d+_\d+_\d+\.txt$/.test(file)) {
          read(file, request);
        }
      } else if (fileName.startsWith('svn/minutes/')) {
      } else if (fileName.startsWith('cache/')) {
      } else {
        if (fileName.match(/^repo\/.*?\/.+/)) return;
        if (fileName.includes('/.svn/')) return;
        broadcast({ type: 'work-update', eventType, fileName });
      }
    });
  }

  // obtain a session token from the live whimsy.apache.org instance
  let { username, password } = credentials(request);
  let session = await new Promise((resolve, reject) => {
    let options = {
      host: 'whimsy.apache.org',
      port: 443,
      path: '/board/agenda/session.json',
      headers: {
        'Authorization': 'Basic ' +
          Buffer.from(username + ':' + password).toString('base64')
      }
    };

    https.get(options, res => {
      let body = "";
      res.on('data', data => { body += data; });
      res.on('end', () => { resolve(JSON.parse(body).session) });
      res.on('error', (error) => { reject(error) });
    });
  });

  // open a websocket connection with the live whimsy.apache.org server,
  // and broadcast any messages received from that websocket to all 
  // browser clients of this server.
  let ws = new WebSocket.Client('wss://whimsy.apache.org/board/agenda/websocket/');

  ws.on('open', (event) => {
    ws.send(`session: ${session}\n\n`);
    active = true;
  });

  ws.on('message', (event) => {
    try {
      let message = JSON.parse(event.data);
      if (!message.type) message.type = 'remote-message';
      if (!deepEqual(message, lastMessage)) {
        lastMessage = message;

        switch (message.type) {
          case 'login':
            break;

          default:
            broadcast(message);
        }
      }
    } catch {
      console.log('message', event.data);
    }
  });

  ws.on('close', (event) => {
    console.log('close', event.code, event.reason);
    ws = null;
    active = false;
  });

}
