// NODE_ENV == 'development':
//  fetch and return historical comments from live whimsy server
// 
// NODE_ENV == 'production':
//   TODO

import devproxy from './devproxy.js';

export default async function historicalComments(request) {

  return await devproxy(request, 'historical-comments');

}
