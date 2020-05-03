// proxy (and cache) requests to the live whimsy server for
// development purposes.

import credentials from '../credentials.js';
import https from 'https';
import * as cache from '../cache.js';

export default async function devproxy(request, path, method = "get", data) {

  let cacheFile = path.split('/').pop();
  if (!cacheFile.includes('.')) cacheFile += '.json';

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
      },
      method
    };

    if (method == 'post' && data) {
      if (typeof data === "string") {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        options.headers['Content-Type'] = 'application/json; charset=utf-8';
        data = JSON.stringify(data);
      };

      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    let request = https.request(options, response => {
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

    if (method == "post" && data) {
      request.write(data);
    }

    request.end();
  })
}
