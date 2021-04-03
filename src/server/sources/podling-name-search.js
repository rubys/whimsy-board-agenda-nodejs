// proxy (and cache) requests to JIRA for a list of projects

import https from 'https';
import * as cache from '../cache.js';

// Override Proposed Names that are wrong
const NAME_FIXES = {
  // Proposed name is actually correct for the issue, but the podling uses
  // 'DataLab'
  "Data Lab": "DataLab"
}

export default async function podlingNameSearch() {
  let cacheFile = 'pns.json';

  let data = await cache.read(cacheFile, 5 * 60 * 1000);
  if (data) return JSON.parse(data);

  // fetch data from JIRA
  let issues = await new Promise((resolve, reject) => {
    let options = {
      host: 'issues.apache.org',
      port: 443,
      path: '/jira/rest/api/2/search?maxResults=1000&jql=project=PODLINGNAMESEARCH&fields=summary,resolution,customfield_12310521'
    };

    let issues = https.get(options, res => {
      let body = "";

      res.on('data', data => {
        body += data;
      });

      res.on('end', () => {
        resolve(JSON.parse(body).issues);
      });

      res.on('error', (error) => {
        reject(error)
      });
    });
  });

  // parse JIRA titles for proposed name
  issues = issues.map(issue => {
    let resolution = issue.fields.resolution;
    resolution = resolution ? resolution.name : "Unresolved";

    // Ignore duplicates and abandoned entries etc.
    // PODLINGNAMESEARCH-9 is resolved as 'Not A Problem': this means it is cleared for use
    if (!["Fixed", "Unresolved", "Resolved", "Implemented"].includes(resolution) && issue.key != "PODLINGNAMESEARCH-9") {
      return
    };

    let name = issue.fields.customfield_12310521;

    if (name) {
      name = name.replace(/^Apache\s+/m, "");
      name = name.replace(/\s+\(.*?\)/g, "");

      // Fix up incorrect 'Proposed Name' entries
      name = NAME_FIXES[name] || name;

      if (/^\s*This/m.test(name) || !/[A-Za-z]{3}/.test(name) || /^N\/A/m.test(name)) {
	name = null
      }
    };

    if (!name) return;
    return [name, {issue: issue.key, resolution}]
  });

  // drop nulls, sort by name, convert to Object keyed by name
  issues = Object.fromEntries(
    issues.filter(issue => issue).
    sort((a, b) => a[0].localeCompare(b[0]))
  );

  cache.write(cacheFile, JSON.stringify(issues))
  return issues;
}
