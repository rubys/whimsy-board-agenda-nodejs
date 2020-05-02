// fetch (and cache) a list of draft reports

// TODOs: a proper project short name to title, and filtering out of abandoned
// drafts from prior reporting periods

import credentials from '../credentials.js';
import https from 'https';
import * as cache from '../cache.js';
import { Board } from "../svn.js"
import CommitteeInfo from "./committee-info.js";

export default async function reporter(request) {

  let cacheFile = 'reporter.json';

  let data = await cache.read(cacheFile, 5 * 60 * 1000);
  if (data) return JSON.parse(data);

  let { username, password } = credentials(request);

  let agenda = (await Board.agendas(request)).pop();

  let committeeName = {};
  for (let committee of (await CommitteeInfo(request)).pmcs) {
    committeeName[committee.id] = committee.display_name;
  };

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
              title: committeeName[project] || project,
              timestamp: status.draft_timestamp,
              author: status.last_author,
              text: status.last_draft
            }]
          ));

        let result = { agenda, drafts: Object.fromEntries(drafts) };

        resolve(result);

        cache.write(cacheFile, JSON.stringify(result))
      });

      res.on('error', (error) => {
        reject(error)
      });
    });
  })
}
