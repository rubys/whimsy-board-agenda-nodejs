// NODE_ENV == 'development':
//  fetch and return mailing list feedback responses from live whimsy server
// 
// NODE_ENV == 'production':
//   TODO

import devproxy from './devproxy.js';

export default async function responses(request) {

  return await devproxy(request, 'json/responses');

}
