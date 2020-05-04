import expressWs from 'express-ws';
import md5 from 'md5';
import { digest } from './cache.js';

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

export async function broadcastDigest() {
  broadcast({ type: 'digest', files: await digest()});
};
