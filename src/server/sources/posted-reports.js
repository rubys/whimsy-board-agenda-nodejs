// NODE_ENV == 'development':
//  fetch and return posted reports from live whimsy server
// 
// NODE_ENV == 'production':
//   TODO

import devproxy from './devproxy.js';

export default async function postedReports(request) {

  return await devproxy(request, 'posted-reports');

}