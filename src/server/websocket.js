import expressWs from 'express-ws';

let wss = null;

export function start(app) {
  const ws = expressWs(app);
  wss = ws.getWss();

  app.ws('/websocket/', (ws, req) => {
    ws.on('message', message => console.log);
    ws.on('close', () => { });
  });
};

export function broadcast(message) {
  if (typeof message === 'object') message = JSON.stringify(message);
  if (wss) wss.clients.forEach(client => {
    try { client.send(message) } catch { };
  });
}