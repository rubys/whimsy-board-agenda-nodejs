// proxy (and cache) requests to JIRA for a list of projects

import https from 'https';
import * as cache from '../cache.js';

export default async function jira() {

  let cacheFile = 'jira.json';

  let data = await cache.read(cacheFile, 5 * 60 * 1000);
  if (data) return JSON.parse(data);

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
        cache.write(cacheFile, JSON.stringify(projects))
      });

      res.on('error', (error) => {
        reject(error)
      });
    });
  })
}
