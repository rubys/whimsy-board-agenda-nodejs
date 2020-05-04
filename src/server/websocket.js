import expressWs from 'express-ws';
import md5 from 'md5';
import { digest } from './cache.js';
import deepEqual from 'deep-equal';

let wss = null;
let authorized = new Set();

// for development purposes, use a single session
export let session = md5(Date.now().toString());

export function start(app) {

  const ws = expressWs(app);
  wss = ws.getWss();

  app.ws('/websocket/', (ws, req) => {
    ws.on('message', async message => {
      if (message.startsWith('session: ')) {
        let clientToken = message.split(' ')[1].trim();
        if (clientToken === session) {
          authorized.add(ws);
          await broadcastDigest();
        } else {
          ws.send(JSON.stringify({ type: "reload" }));
        }
      } else {
        console.log(message);
      }
    });

    ws.on('close', () => { authorized.delete(ws) });
  });
};

export function broadcast(message) {
  if (typeof message === 'object') message = JSON.stringify(message);
  if (wss) wss.clients.forEach(client => {
    if (authorized.has(client)) {
      try { client.send(message) } catch { };
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
