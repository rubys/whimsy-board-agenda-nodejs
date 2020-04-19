// proxy (and cache) requests to the live whimsy server for
// development purposes.

import credentials from '../credentials.js';
import https from 'https';
import * as cache from '../cache.js';

export default async function devproxy(request, path) {

  let cacheFile = `${path.split('/').pop().split('.')[0]}.json`;

  let data = await cache.read(cacheFile, 5 * 60 * 1000);
  if (data) return data;

  let { username, password } = credentials(request);

  return new Promise((resolve, reject) => {
    let options = {
      host: 'whimsy.apache.org',
      port: 443,
      path: `/board/agenda/${path}`,
      headers: {
        'Authorization': 'Basic ' +
          Buffer.from(username + ':' + password).toString('base64')
      }
    };

    https.get(options, res => {
      let body = "";

      res.on('data', data => {
        body += data;
      });

      res.on('end', () => {
        resolve(body);
        cache.write(cacheFile, body)
      });

      res.on('error', (error) => {
        reject(error)
      });
    });
  })
}
