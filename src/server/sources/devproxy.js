// proxy (and cache) requests to the live whimsy server for
// development purposes.

import credentials from '../credentials.js';
import https from 'https';
import * as cache from '../cache.js';

export default async function devproxy(request, path, method = "get", data) {

  let cacheFile = path.split('/').pop();

  if (method === "get") {
    let data = await cache.read(cacheFile, 5 * 60 * 1000);
    if (data) return data;
  }

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

    if (method == 'post' && data) {
      if (typeof data === "string") {
        options['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        options['Content-Type'] = 'application/json; charset=utf-8';
        data = JSON.stringify(data);
      };

      options['Content-Length'] = Buffer.byteLength(data);
    }

    let request = https[method](options, response => {
      let body = "";

      response.on('data', data => {
        body += data;
      });

      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(body);
          if (method === "get") cache.write(cacheFile, body)
        } else {
          resolve(null)
        }
      });

      response.on('error', (error) => {
        reject(error)
      });
    });

    if (method == "post") {
      if (data) request.write(data);
      request.end();
    }
  })
}
