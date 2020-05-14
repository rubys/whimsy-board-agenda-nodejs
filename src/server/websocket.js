import expressWs from 'express-ws';
import md5 from 'md5';
import { digest } from './cache.js';
import deepEqual from 'deep-equal';
import credentials from "./credentials.js";

let wss = null;
let seed = md5(Date.now().toString());

let authorized = new Map(); // client => username
let sessions = new Map(); // session => username
let users = new Map();    // username => { session, clients }

// websockets can be encrypted (wss), but there is built-in authentication
// mechanism defined.  sessionFor provides a unique session token for each
// user.  This can be obtained via the authenticated (and in production,
// encrypted) HTTP GET /api/server.  WebSocket clients are expected to
// provide a known session token in order to be added to the authorized 
// clients list.
export function sessionFor(request) {
  let { username } = credentials(request);
  let { session } = users.get(username) || {};

  if (!session) {
    session = md5(seed + Date.now().toString());
    sessions.set(session, username);
    users.set(username, { session, clients: new Set()})
  }

  return session;
}

export function start(app) {

  const ws = expressWs(app);
  wss = ws.getWss();

  app.ws('/websocket/', (ws, req) => {
    ws.on('message', async message => {
      if (message.startsWith('session: ')) {
        let clientToken = message.split(' ')[1].trim();
        let username = sessions.get(clientToken);

        if (username) {
          authorized.set(ws, username);
          users.get(username).clients.add(ws);

          ws.send(JSON.stringify({ type: 'digest', files: await digest() }));
        } else {
          ws.send(JSON.stringify({ type: "reload" }));
        }
      } else {
        console.log(message);
      }
    });

    ws.on('close', () => {
      let username = authorized.get(ws);

      if (!username) return;
      let { session, clients } = users.get(username);

      // delete this websocket client from the user's client list
      clients.delete(ws);

      // when the client list is empty, delete the user and session
      if (clients.size === 0) {
        users.delete(username);
        sessions.delete(session);
      }

      // delete this client from the authorized list.
      authorized.delete(ws);
    });
  });
};

// broadcast a message.  If 'private' is set, the message will only
// be sent to websockets associated with that user.  If 'private'
// is not set, messages will be sent to all open websockets.
export function broadcast(message) {
  let destination;

  if (typeof message === 'object') {
    destination = message.private;
    message = JSON.stringify(message);
  }

  if (wss) wss.clients.forEach(client => {
    let username = authorized.get(client);
    if (username && (!destination || username === destination)) {
      try { client.send(message) } catch (error) { console.error(error) };
    }
  });
}

// broadcast digests, when changed.  Note: cache files may be 'touched'
// periodically to indicate that they are up to date, but there is no
// need to inform client(s) unless the content itself has changed.
let lastDigest = null;
export async function broadcastDigest() {
  let newDigest = await digest();
  if (!deepEqual(lastDigest, newDigest)) {
    broadcast({ type: 'digest', files: newDigest });
    lastDigest = newDigest;
  }
};

export function debug_status() {
  return {
    authorized: [...authorized.values()],
    sessions: [...sessions.entries()],
    users: [...users.entries()].map(([username, { session, clients }]) => ({ username, session, clients: clients.size }))
  }
}