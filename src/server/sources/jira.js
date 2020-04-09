// proxy (and cache) requests to the live whimsy server for
// development purposes.

import https from 'https';
import { promises as fs } from 'fs';
import { cachePath } from '../config.js';

export default async function jira() {

  let cacheFile = `${cachePath}/jira.json`;

  let cache = await fs.readFile(cacheFile, 'utf8').catch(() => null);
  if (cache) return JSON.parse(cache);

  return new Promise((resolve, reject) => {
    let options = {
      host: 'issues.apache.org',
      port: 443,
      path: '/jira/rest/api/2/project'
    };

    https.get(options, res => {
      let body = "";

      res.on('data', data => {
        body += data;
      });

      res.on('end', () => {
        let projects = JSON.parse(body).map(project => project.key);
        resolve(projects);
        fs.mkdir(cachePath, { recursive: true }).then(() => {
          fs.writeFile(cacheFile, JSON.stringify(projects))
        })
      });

      res.on('error', (error) => {
        reject(error)
      });
    });
  })
}
