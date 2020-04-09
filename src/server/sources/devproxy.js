// proxy (and cache) requests to the live whimsy server for
// development purposes.

import credentials from '../credentials.js';
import https from 'https';
import { promises as fs } from 'fs';
import { cachePath } from '../config.js';

export default async function devproxy(request, path) {

  let cacheFile = `${cachePath}/${path}.json`;

  let cache = await fs.readFile(cacheFile, 'utf8').catch(() => null);
  if (cache) return cache;

  let { username, password } = credentials(request);

  return new Promise((resolve, reject) => {
    let options = {
      host: 'whimsy.apache.org',
      port: 443,
      path: `/board/agenda/json/${path}`,
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
        fs.mkdir(cachePath, { recursive: true }).then(() => {
          fs.writeFile(cacheFile, body)
        })
      });

      res.on('error', (error) => {
        reject(error)
      });
    });
  })
}
