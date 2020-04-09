// fetch (and cache) a list of draft reports

// TODOs: a proper project short name to title, and filtering out of abandoned
// drafts from prior reporting periods

import credentials from '../credentials.js';
import https from 'https';
import { promises as fs } from 'fs';
import { cachePath } from '../config.js';
import { agendas } from "../svn.js"

export default async function reporter(request) {

  let cacheFile = `${cachePath}/reporter.json`;

  let cache = await fs.readFile(cacheFile, 'utf8').catch(() => null);
  if (cache) return JSON.parse(cache);

  let { username, password } = credentials(request);

  let agenda = (await agendas(request)).pop();

  return new Promise((resolve, reject) => {
    let options = {
      host: 'reporter.apache.org',
      port: 443,
      path: '/api/drafts/forgotten',
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
        let drafts = Object.entries(JSON.parse(body).report_status)
          .filter(([project, status]) => status.last_draft)
          .map(([project, status]) => (
            [status.attach, {
              project: project,
              title: project[0].toUpperCase() + project.slice(1),
              timestamp: status.draft_timestamp,
              author: status.last_author,
              text: status.last_draft
            }]
          ));

        let result = { agenda, drafts: Object.fromEntries(drafts) };

        resolve(result);

        fs.mkdir(cachePath, { recursive: true }).then(() => {
          fs.writeFile(cacheFile, JSON.stringify(result))
        })
      });

      res.on('error', (error) => {
        reject(error)
      });
    });
  })
}
