// NODE_ENV == 'development':
//  fetch server information from live whimsy server, and merge in
//  local agenda and draft information as well as location of
//  websocket and associated session token.
// 
// NODE_ENV == 'production':
//   TODO

import devproxy from './devproxy.js';
import { session } from '../websocket.js';
import { Board } from '../svn.js';

export default async function server(request) {

  let remote = JSON.parse(await devproxy(request, 'server.json'));

  remote.agendas = await Board.agendas();
  remote.drafts = await Board.draftMinutes();

  let wsProtocol = request.secure ? 'wss' : 'ws';

  remote.websocket = `${wsProtocol}://${request.get('host')}${request.baseUrl}/websocket`;
  remote.session = session;

  return remote;
}